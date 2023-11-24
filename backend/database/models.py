from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    DateTime,
    JSON,
    LargeBinary,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    items = relationship("Item", back_populates="owner")
    outfits = relationship("Outfit", back_populates="owner")


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="items")


class Outfit(Base):
    __tablename__ = "outfits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    features = Column(JSON)
    entries = Column(JSON)
    thumbnail = Column(LargeBinary)
    last_worn = Column(DateTime)
    white_list = Column(Boolean, default=False)
    favourite = Column(Boolean, default=False)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="outfits")
    entries = relationship("Entry", back_populates="outfit")


class Entry(Base):
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True, index=True)
    features = Column(JSON)
    date_created = Column(DateTime)

    outfit_id = Column(Integer, ForeignKey("outfits.id"), nullable=True)
    outfit = relationship("Outfit", back_populates="entries")
