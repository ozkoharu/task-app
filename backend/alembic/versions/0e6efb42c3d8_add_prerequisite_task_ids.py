"""add prerequisite task ids

Revision ID: 0e6efb42c3d8
Revises: bf422a61d123
Create Date: 2026-01-25 11:57:06.213670

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0e6efb42c3d8'
down_revision: Union[str, None] = 'bf422a61d123'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. まずnullable=Trueで追加
    op.add_column('tasks', sa.Column(
        'prerequisite_task_ids',
        postgresql.ARRAY(sa.String(length=50)),
        nullable=True
    ))
    # 2. 既存データを空配列で更新
    op.execute("UPDATE tasks SET prerequisite_task_ids = '{}' WHERE prerequisite_task_ids IS NULL")
    # 3. NOT NULL制約を追加
    op.alter_column('tasks', 'prerequisite_task_ids', nullable=False, server_default='{}')


def downgrade() -> None:
    op.drop_column('tasks', 'prerequisite_task_ids')
