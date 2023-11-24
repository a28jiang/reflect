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
        orm_mode = True


class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: str


class OutfitBase(BaseModel):
    name: str
    description: str
    features: Dict[str, List[Any]]
    entries: List[int]
    thumbnail: bytes
    last_worn: datetime
    white_list: bool
    favourite: bool


class OutfitCreate(OutfitBase):
    pass


class Outfit(OutfitBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True


class User(UserBase):
    id: int
    is_active: bool
    items: List[Item] = []
    outfits: List[Outfit] = []

    class Config:
        orm_mode = True


class EntryBase(BaseModel):
    features: Dict[str, List[Any]]
    date_created: datetime


class EntryCreate(EntryBase):
    outfit_id: Optional[int] = None


class Entry(EntryBase):
    id: int
    outfit_id: Optional[int] = None

    class Config:
        orm_mode = True
