from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from .database import Base


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    SERVED = "served"
    PAID = "paid"
    CANCELLED = "cancelled"


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    QR = "qr"
    CRYPTO = "crypto"


class TableStatus(str, enum.Enum):
    FREE = "free"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    CLEANING = "cleaning"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="staff")  # admin, manager, staff
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="users")
    orders = relationship("Order", back_populates="user")


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    slug = Column(String, unique=True, index=True)
    phone = Column(String)
    email = Column(String)
    address = Column(String)
    timezone = Column(String, default="Europe/Madrid")
    currency = Column(String, default="EUR")
    language = Column(String, default="es")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="tenant")
    tables = relationship("Table", back_populates="tenant")
    menu_items = relationship("MenuItem", back_populates="tenant")
    orders = relationship("Order", back_populates="tenant")


class Table(Base):
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    number = Column(Integer)
    capacity = Column(Integer)
    status = Column(SQLEnum(TableStatus), default=TableStatus.FREE)
    zone = Column(String, default="salon")  # salon, terraza, barra
    created_at = Column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="tables")
    orders = relationship("Order", back_populates="table")


class MenuCategory(Base):
    __tablename__ = "menu_categories"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    name = Column(String)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    items = relationship("MenuItem", back_populates="category")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    category_id = Column(Integer, ForeignKey("menu_categories.id"))
    name = Column(String, index=True)
    description = Column(Text)
    price = Column(Float)
    cost = Column(Float, default=0.0)
    allergens = Column(String)  # comma-separated
    is_available = Column(Boolean, default=True)
    is_vegetarian = Column(Boolean, default=False)
    is_vegan = Column(Boolean, default=False)
    is_gluten_free = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="menu_items")
    category = relationship("MenuCategory", back_populates="items")
    order_items = relationship("OrderItem", back_populates="menu_item")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    order_number = Column(String, index=True)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    subtotal = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    payment_method = Column(SQLEnum(PaymentMethod), nullable=True)
    payment_status = Column(String, default="pending")  # pending, paid, failed, refunded
    notes = Column(Text)
    source = Column(String, default="pos")  # pos, whatsapp, web
    created_at = Column(DateTime, default=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)

    tenant = relationship("Tenant", back_populates="orders")
    table = relationship("Table", back_populates="orders")
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"))
    quantity = Column(Integer, default=1)
    unit_price = Column(Float)
    total_price = Column(Float)
    notes = Column(Text)
    modifiers = Column(Text)  # JSON string

    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="order_items")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    amount = Column(Float)
    method = Column(SQLEnum(PaymentMethod))
    status = Column(String, default="pending")
    stripe_payment_id = Column(String, nullable=True)
    tip_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    name = Column(String, index=True)
    sku = Column(String)
    category = Column(String)
    unit = Column(String)  # kg, units, liters
    current_stock = Column(Float, default=0.0)
    min_stock = Column(Float, default=0.0)
    max_stock = Column(Float, default=0.0)
    cost_per_unit = Column(Float, default=0.0)
    supplier = Column(String)
    last_restocked = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"))
    type = Column(String)  # in, out, waste, adjustment
    quantity = Column(Float)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class StaffShift(Base):
    __tablename__ = "staff_shifts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    clock_in = Column(DateTime)
    clock_out = Column(DateTime, nullable=True)
    role = Column(String)
    hourly_rate = Column(Float, default=0.0)
    tips_earned = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
