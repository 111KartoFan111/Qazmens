# Create this migration file: backend/alembic/versions/001_create_auth_tables.py
"""Create auth tables

Revision ID: 001
Revises: 
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Create properties table
    op.create_table('properties',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('address', sa.String(), nullable=False),
        sa.Column('property_type', sa.String(), nullable=False),
        sa.Column('area', sa.Float(), nullable=False),
        sa.Column('floor_level', sa.Integer(), nullable=False),
        sa.Column('total_floors', sa.Integer(), nullable=False),
        sa.Column('condition', sa.String(), nullable=False),
        sa.Column('renovation_status', sa.String(), nullable=False),
        sa.Column('location', sa.JSON(), nullable=True),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('features', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_properties_id'), 'properties', ['id'], unique=False)
    op.create_index(op.f('ix_properties_address'), 'properties', ['address'], unique=False)
    op.create_index(op.f('ix_properties_property_type'), 'properties', ['property_type'], unique=False)

    # Create valuation_history table
    op.create_table('valuation_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('property_id', sa.Integer(), nullable=False),
        sa.Column('valuation_date', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('valuation_type', sa.String(), nullable=False),
        sa.Column('original_price', sa.Float(), nullable=False),
        sa.Column('adjusted_price', sa.Float(), nullable=False),
        sa.Column('adjustments', sa.JSON(), nullable=True),
        sa.Column('comparable_properties', sa.JSON(), nullable=True),
        sa.Column('created_by', sa.String(), nullable=False),
        sa.Column('notes', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id'], )
    )
    op.create_index(op.f('ix_valuation_history_id'), 'valuation_history', ['id'], unique=False)

    # Create adjustment_coefficients table
    op.create_table('adjustment_coefficients',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('feature_name', sa.String(), nullable=False),
        sa.Column('coefficient_value', sa.Float(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('created_by', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_adjustment_coefficients_id'), 'adjustment_coefficients', ['id'], unique=False)
    op.create_index(op.f('ix_adjustment_coefficients_feature_name'), 'adjustment_coefficients', ['feature_name'], unique=False)

    # Create property_features table
    op.create_table('property_features',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('property_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('value', sa.Float(), nullable=False),
        sa.Column('unit', sa.String(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id'], )
    )
    op.create_index(op.f('ix_property_features_id'), 'property_features', ['id'], unique=False)
    op.create_index(op.f('ix_property_features_name'), 'property_features', ['name'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index(op.f('ix_property_features_name'), table_name='property_features')
    op.drop_index(op.f('ix_property_features_id'), table_name='property_features')
    op.drop_table('property_features')
    
    op.drop_index(op.f('ix_adjustment_coefficients_feature_name'), table_name='adjustment_coefficients')
    op.drop_index(op.f('ix_adjustment_coefficients_id'), table_name='adjustment_coefficients')
    op.drop_table('adjustment_coefficients')
    
    op.drop_index(op.f('ix_valuation_history_id'), table_name='valuation_history')
    op.drop_table('valuation_history')
    
    op.drop_index(op.f('ix_properties_property_type'), table_name='properties')
    op.drop_index(op.f('ix_properties_address'), table_name='properties')
    op.drop_index(op.f('ix_properties_id'), table_name='properties')
    op.drop_table('properties')
    
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')