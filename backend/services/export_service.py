# backend/services/export_service.py
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from datetime import datetime
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import io
import os
import base64

class ExportService:
    def export_to_excel(
        self,
        db: Session,
        properties: List[models.Property],
        output_path: str
    ) -> str:
        """
        Export properties to Excel file
        """
        # Create DataFrame
        data = []
        for prop in properties:
            data.append({
                "ID": prop.id,
                "Address": prop.address,
                "Type": prop.property_type,
                "Area": prop.area,
                "Floor": prop.floor_level,
                "Total Floors": prop.total_floors,
                "Condition": prop.condition,
                "Renovation": prop.renovation_status,
                "Price": prop.price,
                "Created At": prop.created_at,
                "Updated At": prop.updated_at
            })

        df = pd.DataFrame(data)

        # Create Excel writer
        with pd.ExcelWriter(output_path, engine='xlsxwriter') as writer:
            df.to_excel(writer, sheet_name='Properties', index=False)
            
            # Get workbook and worksheet objects
            workbook = writer.book
            worksheet = writer.sheets['Properties']

            # Add formatting
            header_format = workbook.add_format({
                'bold': True,
                'text_wrap': True,
                'valign': 'top',
                'fg_color': '#D7E4BC',
                'border': 1
            })

            # Write headers with formatting
            for col_num, value in enumerate(df.columns.values):
                worksheet.write(0, col_num, value, header_format)

            # Adjust column widths
            for idx, col in enumerate(df.columns):
                max_length = max(
                    df[col].astype(str).apply(len).max(),
                    len(col)
                )
                worksheet.set_column(idx, idx, max_length + 2)

        return output_path

    def export_to_pdf(
        self,
        db: Session,
        property: models.Property,
        output_path: str,
        valuation_result: Optional[schemas.ValuationResult] = None
    ) -> str:
        """
        Export property details and valuation to PDF
        """
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )

        # Container for PDF elements
        elements = []

        # Add title
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30
        )
        elements.append(Paragraph("Property Valuation Report", title_style))
        elements.append(Spacer(1, 12))

        # Property details
        elements.append(Paragraph("Property Details", styles['Heading2']))
        elements.append(Spacer(1, 12))

        property_data = [
            ["Address", property.address],
            ["Type", property.property_type],
            ["Area", f"{property.area} m²"],
            ["Floor", f"{property.floor_level} of {property.total_floors}"],
            ["Condition", property.condition],
            ["Renovation Status", property.renovation_status],
            ["Price", f"${property.price:,.2f}"],
            ["Created At", property.created_at.strftime("%Y-%m-%d %H:%M:%S")],
            ["Updated At", property.updated_at.strftime("%Y-%m-%d %H:%M:%S")]
        ]

        # Create property details table
        property_table = Table(property_data, colWidths=[2*inch, 4*inch])
        property_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(property_table)
        elements.append(Spacer(1, 20))

        # Add valuation results if available
        if valuation_result:
            elements.append(Paragraph("Valuation Results", styles['Heading2']))
            elements.append(Spacer(1, 12))

            # Final valuation
            elements.append(Paragraph(
                f"Final Valuation: ${valuation_result.final_valuation:,.2f}",
                styles['Heading3']
            ))
            elements.append(Spacer(1, 12))

            # Confidence score
            elements.append(Paragraph(
                f"Confidence Score: {valuation_result.confidence_score:.2%}",
                styles['Normal']
            ))
            elements.append(Spacer(1, 12))

            # Adjustments
            elements.append(Paragraph("Adjustments", styles['Heading3']))
            elements.append(Spacer(1, 12))

            adjustment_data = [["Feature", "Value", "Description"]]
            for comp_id, adjustments in valuation_result.adjustments.items():
                for adj in adjustments:
                    adjustment_data.append([
                        adj.feature,
                        f"${adj.value:,.2f}",
                        adj.description or ""
                    ])

            # Create adjustments table
            adjustment_table = Table(adjustment_data, colWidths=[2*inch, 2*inch, 2*inch])
            adjustment_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(adjustment_table)

        # Build PDF
        doc.build(elements)
        return output_path

    async def generate_pdf(self, valuation_data: schemas.ValuationResult) -> str:
        """
        Generate PDF report and return as base64 string
        """
        # Create temporary file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        temp_path = f"/tmp/valuation_report_{timestamp}.pdf"
        
        try:
            # Generate PDF
            self.export_to_pdf(
                db=None,
                property=valuation_data.subject_property,
                output_path=temp_path,
                valuation_result=valuation_data
            )
            
            # Read and encode as base64
            with open(temp_path, 'rb') as f:
                pdf_data = f.read()
                encoded = base64.b64encode(pdf_data).decode('utf-8')
            
            # Clean up
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
            return encoded
        except Exception as e:
            # Clean up on error
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e

    async def generate_excel(self, valuation_data: schemas.ValuationResult) -> str:
        """
        Generate Excel report and return as base64 string
        """
        # Create temporary file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        temp_path = f"/tmp/valuation_report_{timestamp}.xlsx"
        
        try:
            # Prepare data
            all_properties = [valuation_data.subject_property] + valuation_data.comparable_properties
            
            # Convert to list of dicts for DataFrame
            properties_data = []
            for prop in all_properties:
                properties_data.append({
                    "ID": prop.id,
                    "Address": prop.address,
                    "Type": prop.property_type,
                    "Area": prop.area,
                    "Floor": prop.floor_level,
                    "Total Floors": prop.total_floors,
                    "Condition": prop.condition,
                    "Renovation": prop.renovation_status,
                    "Price": prop.price,
                    "Role": "Subject" if prop.id == valuation_data.subject_property.id else "Comparable"
                })
            
            # Generate Excel
            df = pd.DataFrame(properties_data)
            df.to_excel(temp_path, index=False, sheet_name='Properties')
            
            # Read and encode as base64
            with open(temp_path, 'rb') as f:
                excel_data = f.read()
                encoded = base64.b64encode(excel_data).decode('utf-8')
            
            # Clean up
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
            return encoded
        except Exception as e:
            # Clean up on error
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e

    def generate_report(
        self,
        db: Session,
        property_id: int,
        format: str = "pdf",
        output_dir: str = "reports"
    ) -> str:
        """
        Generate property report in specified format
        """
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

        # Get property
        property = db.query(models.Property).filter(models.Property.id == property_id).first()
        if not property:
            raise ValueError(f"Property with ID {property_id} not found")

        # Get latest valuation
        valuation = db.query(models.ValuationHistory)\
            .filter(models.ValuationHistory.property_id == property_id)\
            .order_by(models.ValuationHistory.valuation_date.desc())\
            .first()

        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"property_{property_id}_{timestamp}.{format}"
        output_path = os.path.join(output_dir, filename)

        if format.lower() == "pdf":
            return self.export_to_pdf(db, property, output_path, valuation)
        elif format.lower() == "excel":
            return self.export_to_excel(db, [property], output_path)
        else:
            raise ValueError(f"Unsupported format: {format}")

export_service = ExportService()