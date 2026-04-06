# Core Module Structure

Struktur folder ini mengikuti **Clean Architecture** dan **Domain-Driven Design (DDD)** dengan pemisahan layer yang jelas.

## 📁 Struktur Folder

```
internal/core/
├── shared/                    # Shared resources across all modules
│   └── models/               # Base models (BaseModel, TenantModel, etc)
│       ├── base.go           # BaseModel, TenantModel
│       └── tenant.go         # Tenant model
│
├── master-data/              # Master data modules
│   ├── products/             # Product & Category management
│   │   ├── data/            # Data layer (Repository)
│   │   │   └── repository.go
│   │   ├── domain/          # Domain layer (Models, Services)
│   │   │   ├── product.go
│   │   │   ├── category.go
│   │   │   └── service.go
│   │   └── presentation/    # Presentation layer (Handlers, DTOs)
│   │       ├── handler.go
│   │       └── dto.go
│   │
│   ├── customer/            # Customer management
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   │
│   └── outlet/               # Outlet management
│       ├── data/
│       ├── domain/
│       └── presentation/
│
├── auth/                     # Authentication & Authorization
│   ├── data/                # User repository
│   ├── domain/              # User model, Auth service
│   └── presentation/        # Auth handlers, DTOs
│
├── sales/                    # Sales & Transactions
│   ├── data/                # Sale, Shift repositories
│   ├── domain/              # Sale, Shift models, Services
│   └── presentation/        # Sale, Shift handlers, DTOs
│
├── finance/                  # Finance & Payments
│   ├── data/                # Payment repository
│   ├── domain/              # Payment model, Service
│   └── presentation/        # Payment handlers, DTOs
│
├── infrastructure/           # Infrastructure layer
│   ├── config/              # Configuration
│   ├── database/            # Database connection & migrations
│   └── router/              # Route setup
│
├── middleware/              # HTTP middleware
└── utils/                   # Shared utilities
    ├── errors/              # Error handling
    ├── response/            # API response helpers
    └── validators/          # Validation helpers
```

## 🏗️ Layer Architecture

### 1. **Data Layer** (`data/`)
- **Repository Pattern**: Data access abstraction
- **Database Operations**: CRUD operations, queries
- **External Services**: API clients, third-party integrations

**Example:**
```go
type ProductRepository struct {
    db *gorm.DB
}

func (r *ProductRepository) Create(product *domain.Product) error {
    return r.db.Create(product).Error
}
```

### 2. **Domain Layer** (`domain/`)
- **Models**: Business entities (Product, Sale, Customer, etc)
- **Services**: Business logic, validation rules
- **Domain Rules**: Core business rules and validations

**Example:**
```go
type ProductService struct {
    repo *data.ProductRepository
}

func (s *ProductService) CreateProduct(req *presentation.CreateProductRequest) (*domain.Product, error) {
    // Business logic here
    // Validation, calculations, etc
}
```

### 3. **Presentation Layer** (`presentation/`)
- **Handlers**: HTTP request handlers (Gin handlers)
- **DTOs**: Data Transfer Objects (Request/Response structs)
- **Routes**: Route definitions (can be in separate routes.go file)

**Example:**
```go
type ProductHandler struct {
    service *domain.ProductService
}

func (h *ProductHandler) CreateProduct(c *gin.Context) {
    var req CreateProductRequest
    // Bind request, call service, return response
}
```

## 📦 Module Organization

### Master Data Modules
- **products**: Product catalog, categories, inventory
- **customer**: Customer management, loyalty program
- **outlet**: Outlet/branch management

### Feature Modules
- **auth**: Authentication, authorization, user management
- **sales**: Sales transactions, shift management
- **finance**: Payments, financial transactions

## 🔄 Data Flow

```
HTTP Request
    ↓
Presentation Layer (Handler)
    ↓
Domain Layer (Service)
    ↓
Data Layer (Repository)
    ↓
Database
```

## 📝 Best Practices

1. **Dependency Direction**: 
   - Presentation → Domain → Data
   - Never reverse dependencies

2. **Models Location**:
   - Domain models in `domain/` folder
   - Shared base models in `shared/models/`

3. **Service Layer**:
   - All business logic in services
   - Services call repositories, not direct DB access

4. **DTOs**:
   - Separate DTOs for requests and responses
   - Don't expose domain models directly in API

5. **Error Handling**:
   - Use shared error utilities from `utils/errors`
   - Follow API error standards

## 🚀 Next Steps

1. Implement repositories in `data/` layer
2. Implement services in `domain/` layer
3. Implement handlers in `presentation/` layer
4. Define DTOs for all API endpoints
5. Add route definitions in `presentation/routes.go` (optional)


