package main

import (
	"log"
	"os"
	"os/exec"
)

// gen is a code generation tool
// This can be used to generate code from SQL schemas, OpenAPI specs, etc.
// Example: sqlc, protobuf, etc.
func main() {
	if len(os.Args) < 2 {
		log.Println("Usage: go run cmd/gen/main.go <tool> [args...]")
		log.Println("")
		log.Println("Available tools:")
		log.Println("  sqlc     - Generate type-safe Go code from SQL")
		log.Println("  migrate  - Generate database migrations")
		log.Println("  openapi  - Generate OpenAPI documentation")
		os.Exit(1)
	}

	tool := os.Args[1]
	args := os.Args[2:]

	var cmd *exec.Cmd

	switch tool {
	case "sqlc":
		// Generate code using sqlc
		cmd = exec.Command("sqlc", "generate")
		log.Println("🔧 Running sqlc generate...")
	case "migrate":
		// Generate migration files
		if len(args) < 1 {
			log.Fatal("Usage: go run cmd/gen/main.go migrate <migration_name>")
		}
		cmd = exec.Command("migrate", "create", "-ext", "sql", "-dir", "migrations", args[0])
		log.Printf("🔧 Creating migration: %s...", args[0])
	case "openapi":
		// Generate OpenAPI spec (will be implemented later)
		log.Println("📝 OpenAPI generation will be implemented later")
		os.Exit(0)
	default:
		log.Fatalf("❌ Unknown tool: %s", tool)
	}

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		log.Fatalf("❌ Failed to run %s: %v", tool, err)
	}

	log.Println("✅ Code generation completed successfully")
}


