package repositories

import (
	financeModels "gipos/api/internal/finance/data/models"
	salesModels "gipos/api/internal/sales/data/models"
	"time"

	"gorm.io/gorm"
)

type DailyRevenueRow struct {
	Date     time.Time `gorm:"column:date"`
	Cash     int64     `gorm:"column:cash"`
	QRIS     int64     `gorm:"column:qris"`
	Revenue  int64     `gorm:"column:revenue"`
}

type FinanceRepository struct {
	db *gorm.DB
}

func NewFinanceRepository(db *gorm.DB) *FinanceRepository {
	return &FinanceRepository{db: db}
}

func (r *FinanceRepository) dbFor(tx *gorm.DB) *gorm.DB {
	if tx != nil {
		return tx
	}
	return r.db
}

func (r *FinanceRepository) Transaction(fn func(tx *gorm.DB) error) error {
	return r.db.Transaction(fn)
}

func (r *FinanceRepository) GetOpeningBalance(tenantID uint) (*financeModels.OpeningBalance, error) {
	var opening financeModels.OpeningBalance
	err := r.db.Where("tenant_id = ? AND deleted_at IS NULL", tenantID).
		Order("effective_date ASC").
		First(&opening).Error
	if err != nil {
		return nil, err
	}

	return &opening, nil
}

func (r *FinanceRepository) CreateOpeningBalance(opening *financeModels.OpeningBalance) error {
	return r.db.Create(opening).Error
}

func (r *FinanceRepository) CreateExpenseEntryWithItems(entry *financeModels.ExpenseEntry, items []financeModels.ExpenseItem) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(entry).Error; err != nil {
			return err
		}

		if len(items) > 0 {
			for index := range items {
				items[index].EntryID = entry.ID
			}
			if err := tx.Create(&items).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *FinanceRepository) GetExpenseEntryByID(tx *gorm.DB, tenantID, entryID uint) (*financeModels.ExpenseEntry, error) {
	var entry financeModels.ExpenseEntry
	err := r.dbFor(tx).
		Where("tenant_id = ? AND id = ? AND deleted_at IS NULL", tenantID, entryID).
		First(&entry).Error
	if err != nil {
		return nil, err
	}

	return &entry, nil
}

func (r *FinanceRepository) SaveExpenseEntry(tx *gorm.DB, entry *financeModels.ExpenseEntry) error {
	return r.dbFor(tx).Save(entry).Error
}

func (r *FinanceRepository) DeleteExpenseEntry(tx *gorm.DB, tenantID, entryID uint) error {
	return r.dbFor(tx).Where("tenant_id = ? AND id = ?", tenantID, entryID).Delete(&financeModels.ExpenseEntry{}).Error
}

func (r *FinanceRepository) ListExpenseItemsByEntryID(tx *gorm.DB, tenantID, entryID uint) ([]financeModels.ExpenseItem, error) {
	var items []financeModels.ExpenseItem
	err := r.dbFor(tx).
		Where("tenant_id = ? AND entry_id = ? AND deleted_at IS NULL", tenantID, entryID).
		Order("created_at ASC").
		Find(&items).Error
	if err != nil {
		return nil, err
	}

	return items, nil
}

func (r *FinanceRepository) ListExpenseEntriesWithItems(tenantID uint, startDate, endDate time.Time) ([]financeModels.ExpenseEntry, error) {
	var entries []financeModels.ExpenseEntry

	err := r.db.
		Preload("ExpenseItems", "deleted_at IS NULL").
		Where("tenant_id = ? AND deleted_at IS NULL", tenantID).
		Where("entry_date >= ? AND entry_date <= ?", startDate, endDate).
		Order("entry_date ASC").
		Order("created_at ASC").
		Find(&entries).Error
	if err != nil {
		return nil, err
	}

	return entries, nil
}

func (r *FinanceRepository) GetDailyRevenueByDateRange(tenantID uint, startDate, endDate time.Time) ([]DailyRevenueRow, error) {
	var rows []DailyRevenueRow
	localDateExpr := "DATE(COALESCE(s.completed_at, s.paid_at, s.created_at) AT TIME ZONE 'Asia/Jakarta')"
	startDateValue := startDate.Format("2006-01-02")
	endDateValue := endDate.Format("2006-01-02")

	err := r.db.Table("sales s").
		Where("s.tenant_id = ? AND s.deleted_at IS NULL", tenantID).
		Where("s.status = ? AND s.payment_status = ?", salesModels.SaleStatusCompleted, salesModels.PaymentStatusCompleted).
		Where(localDateExpr+" >= ? AND "+localDateExpr+" <= ?", startDateValue, endDateValue).
		Select(`
			`+localDateExpr+` AS date,
			CAST(COALESCE(SUM(CASE WHEN s.payment_method = 'cash' THEN s.total ELSE 0 END), 0) / 100 AS bigint) AS cash,
			CAST(COALESCE(SUM(CASE WHEN s.payment_method = 'qris' THEN s.total ELSE 0 END), 0) / 100 AS bigint) AS qris,
			CAST(COALESCE(SUM(s.total), 0) / 100 AS bigint) AS revenue
		`).
		Group(localDateExpr).
		Order(localDateExpr + " ASC").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	return rows, nil
}

func (r *FinanceRepository) ListFixedExpenseComponents(tenantID uint) ([]financeModels.FixedExpenseComponent, error) {
	var components []financeModels.FixedExpenseComponent

	err := r.db.
		Where("tenant_id = ? AND deleted_at IS NULL", tenantID).
		Order("sort_order ASC").
		Order("created_at ASC").
		Find(&components).Error
	if err != nil {
		return nil, err
	}

	return components, nil
}

func (r *FinanceRepository) CreateFixedExpenseComponents(components []financeModels.FixedExpenseComponent) error {
	if len(components) == 0 {
		return nil
	}

	return r.db.Create(&components).Error
}

func (r *FinanceRepository) CreateFixedExpenseComponent(component *financeModels.FixedExpenseComponent) error {
	return r.db.Create(component).Error
}

func (r *FinanceRepository) GetFixedExpenseComponentByID(tenantID, componentID uint) (*financeModels.FixedExpenseComponent, error) {
	var component financeModels.FixedExpenseComponent
	err := r.db.
		Where("tenant_id = ? AND id = ? AND deleted_at IS NULL", tenantID, componentID).
		First(&component).Error
	if err != nil {
		return nil, err
	}

	return &component, nil
}

func (r *FinanceRepository) SaveFixedExpenseComponent(component *financeModels.FixedExpenseComponent) error {
	return r.db.Save(component).Error
}

func (r *FinanceRepository) GetExpenseItemByID(tx *gorm.DB, tenantID, itemID uint) (*financeModels.ExpenseItem, error) {
	var item financeModels.ExpenseItem
	err := r.dbFor(tx).
		Where("tenant_id = ? AND id = ? AND deleted_at IS NULL", tenantID, itemID).
		First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *FinanceRepository) SaveExpenseItem(tx *gorm.DB, item *financeModels.ExpenseItem) error {
	return r.dbFor(tx).Save(item).Error
}

func (r *FinanceRepository) DeleteExpenseItem(tx *gorm.DB, tenantID, itemID uint) error {
	return r.dbFor(tx).Where("tenant_id = ? AND id = ?", tenantID, itemID).Delete(&financeModels.ExpenseItem{}).Error
}
