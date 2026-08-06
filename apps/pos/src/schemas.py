from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ─── Auth ───
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "staff"


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


# ─── Tenant ───
class TenantCreate(BaseModel):
    name: str
    slug: str
    phone: str
    email: EmailStr
    address: Optional[str] = None
    timezone: str = "Europe/Madrid"
    currency: str = "EUR"
    language: str = "es"


class TenantResponse(BaseModel):
    id: int
    name: str
    slug: str
    phone: str
    email: str
    is_active: bool

    class Config:
        from_attributes = True


# ─── Table ───
class TableCreate(BaseModel):
    number: int
    capacity: int
    zone: str = "salon"


class TableUpdate(BaseModel):
    number: Optional[int] = None
    capacity: Optional[int] = None
    zone: Optional[str] = None
    status: Optional[str] = None


class TableResponse(BaseModel):
    id: int
    number: int
    capacity: int
    status: str
    zone: str

    class Config:
        from_attributes = True


# ─── Menu Category ───
class CategoryCreate(BaseModel):
    name: str
    sort_order: int = 0


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    sort_order: int
    is_active: bool

    class Config:
        from_attributes = True


# ─── Menu ───
class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    cost: float = 0.0
    allergens: Optional[str] = None
    is_vegetarian: bool = False
    is_vegan: bool = False
    is_gluten_free: bool = False
    category_id: Optional[int] = None


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_available: Optional[bool] = None


class MenuItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    cost: float
    allergens: Optional[str]
    is_available: bool
    is_vegetarian: bool
    is_vegan: bool
    is_gluten_free: bool
    category_id: Optional[int]

    class Config:
        from_attributes = True


# ─── Order ───
class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = 1
    unit_price: float
    notes: Optional[str] = None
    modifiers: Optional[str] = None


class OrderCreate(BaseModel):
    table_id: Optional[int] = None
    items: List[OrderItemCreate]
    notes: Optional[str] = None
    source: str = "pos"
    payment_method: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    unit_price: float
    total_price: float
    notes: Optional[str]

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    order_number: str
    status: str
    subtotal: float
    tax: float
    total: float
    payment_method: Optional[str]
    payment_status: str
    table_id: Optional[int]
    items: List[OrderItemResponse]
    created_at: datetime
    closed_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Payment ───
class PaymentCreate(BaseModel):
    order_id: int
    amount: float
    method: str
    tip_amount: float = 0.0


class PaymentResponse(BaseModel):
    id: int
    order_id: int
    amount: float
    method: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Inventory ───
class InventoryItemCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    category: str
    unit: str
    current_stock: float = 0.0
    min_stock: float = 0.0
    max_stock: float = 0.0
    cost_per_unit: float = 0.0
    supplier: Optional[str] = None


class InventoryItemResponse(BaseModel):
    id: int
    name: str
    sku: Optional[str]
    category: str
    unit: str
    current_stock: float
    min_stock: float
    max_stock: float
    cost_per_unit: float

    class Config:
        from_attributes = True


# ─── Report ───
class DailyReport(BaseModel):
    date: str
    total_orders: int
    total_revenue: float
    total_cogs: float
    gross_profit: float
    avg_order_value: float
    peak_hours: List[dict]
    top_selling_items: List[dict]
    payment_breakdown: dict
    staff_hours: float
    labor_cost: float
