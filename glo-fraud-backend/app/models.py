import sqlalchemy as sa
from sqlalchemy import Column, String, BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Worker(Base):
    __tablename__ = "workers"
    username = Column(String(255), primary_key=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    user_id = Column(BigInteger, index=True, nullable=True)
    status = Column(String(50), nullable=True)
    mentor_user_id = Column(BigInteger, index=True, nullable=True)
    join_time = Column(DateTime, server_default=sa.func.current_timestamp(), nullable=True)
    tokens = relationship("Token", back_populates="worker", cascade="all, delete-orphan")


class Token(Base):
    __tablename__ = "tokens"
    id = Column(BigInteger, primary_key=True, index=True)
    token = Column(String(512), unique=True, index=True, nullable=False)
    worker_username = Column(String(255), ForeignKey("workers.username"), nullable=False)
    user_agent = Column(String(256))
    expires = Column(DateTime, nullable=False)
    worker = relationship("Worker", back_populates="tokens")
