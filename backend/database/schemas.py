from typing import List, Union, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel


class UserLogin(BaseModel):
    email: str
    password: str


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
    password: str
    first_name: str
    last_name: str


class UserCreate(UserBase):
    pass


class EntryBase(BaseModel):
    features: Dict[str, Any]
    date_created: datetime = datetime.now()


class EntryCreate(EntryBase):
    outfit_id: Optional[int] = None


class Entry(EntryBase):
    id: int
    outfit_id: Optional[int] = None

    class Config:
        from_attributes = True


class OutfitBase(BaseModel):
    name: str
    description: Optional[str] = None
    features: Dict[str, Any] = {}
    entries: Optional[List[Entry]] = []
    thumbnail: Optional[str] = None
    last_worn: Optional[datetime] = datetime.now()
    white_list: Optional[bool] = None
    favourite: Optional[bool] = None


class OutfitCreate(OutfitBase):
    pass


class OutfitUpdate(OutfitBase):
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
