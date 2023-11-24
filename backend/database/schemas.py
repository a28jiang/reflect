from typing import List, Union, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel


class ItemBase(BaseModel):
    title: str
    description: Union[str, None] = None


class ItemCreate(ItemBase):
    pass


class Item(ItemBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: str


class OutfitBase(BaseModel):
    name: str
    description: Optional[str] = None
    features: Dict[str, Any]
    entries: Optional[List[int]] = []
    thumbnail: Optional[bytes] = None
    last_worn: Optional[datetime] = None
    white_list: Optional[bool] = None
    favourite: Optional[bool] = None


class OutfitCreate(OutfitBase):
    pass


class Outfit(OutfitBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True


class User(UserBase):
    id: int
    is_active: bool
    items: List[Item] = []
    outfits: List[Outfit] = []

    class Config:
        from_attributes = True


class EntryBase(BaseModel):
    features: Dict[str, List[Any]]
    date_created: datetime


class EntryCreate(EntryBase):
    outfit_id: Optional[int] = None


class Entry(EntryBase):
    id: int
    outfit_id: Optional[int] = None

    class Config:
        from_attributes = True
