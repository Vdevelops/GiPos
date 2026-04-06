package service

import (
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"testing"
)

func TestNoDirectStockQuantityUpdateOutsideStockService(t *testing.T) {
	_, currentFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("failed to resolve caller path")
	}

	apiRoot := filepath.Clean(filepath.Join(filepath.Dir(currentFile), "..", "..", "..", ".."))
	internalRoot := filepath.Join(apiRoot, "internal")

	allowed := map[string]bool{
		filepath.ToSlash(filepath.Join("internal", "stock", "domain", "service", "stock_service.go")): true,
	}

	patterns := []*regexp.Regexp{
		regexp.MustCompile(`\.Update\(\s*"quantity"\s*,`),
		regexp.MustCompile(`(?s)\.Updates\(\s*map\[string\]interface\{\}\s*\{[^}]*"quantity"\s*:`),
	}

	var violations []string
	err := filepath.WalkDir(internalRoot, func(path string, d os.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if d.IsDir() {
			return nil
		}
		if !strings.HasSuffix(path, ".go") || strings.HasSuffix(path, "_test.go") {
			return nil
		}

		rel, err := filepath.Rel(apiRoot, path)
		if err != nil {
			return err
		}
		rel = filepath.ToSlash(rel)
		if allowed[rel] {
			return nil
		}

		content, err := os.ReadFile(path)
		if err != nil {
			return err
		}

		for _, pattern := range patterns {
			if pattern.Match(content) {
				violations = append(violations, rel)
				break
			}
		}

		return nil
	})
	if err != nil {
		t.Fatalf("failed to scan source files: %v", err)
	}

	if len(violations) > 0 {
		t.Fatalf("direct stock quantity updates found outside StockService: %s", strings.Join(violations, ", "))
	}
}
