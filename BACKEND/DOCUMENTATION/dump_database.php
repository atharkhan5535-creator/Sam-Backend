<?php
/**
 * Complete Database Dump Script
 * Dumps all tables, structures, and data from the database
 * Output saved to DATABASE_DUMP.md with SQL INSERT statements
 */

require_once __DIR__ . '/../config/database.php';

$db = Database::getInstance()->getConnection();

$output = "# Database Dump\n\n";
$output .= "**Generated:** " . date('Y-m-d H:i:s') . "\n\n";

try {
    // Get all table names (excluding views initially)
    $stmt = $db->query("SHOW FULL TABLES WHERE Table_type != 'VIEW'");
    $tables = [];
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }

    // Get all views
    $stmt = $db->query("SHOW FULL TABLES WHERE Table_type = 'VIEW'");
    $views = [];
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $views[] = $row[0];
    }

    $output .= "## Summary\n\n";
    $output .= "**Total Tables:** " . count($tables) . "\n";
    $output .= "**Total Views:** " . count($views) . "\n\n";

    $output .= "### Tables List\n\n";
    foreach ($tables as $table) {
        $output .= "- `$table`\n";
    }
    $output .= "\n";

    if (count($views) > 0) {
        $output .= "### Views List\n\n";
        foreach ($views as $view) {
            $output .= "- `$view`\n";
        }
        $output .= "\n";
    }

    $output .= "---\n\n";

    // Dump each table
    foreach ($tables as $table) {
        echo "Processing table: $table\n";

        $output .= "## Table: `$table`\n\n";

        try {
            // Get table structure using SHOW CREATE TABLE
            $stmt = $db->query("SHOW CREATE TABLE $table");
            $createStmt = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $output .= "### Structure\n\n";
            $output .= "```sql\n";
            $output .= $createStmt['Create Table'] ?? 'Unable to get table structure';
            $output .= "\n```\n\n";

            // Get row count
            $stmt = $db->query("SELECT COUNT(*) as count FROM $table");
            $rowCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            $output .= "### Row Count: $rowCount\n\n";

            // Get all data - NO LIMIT
            if ($rowCount > 0) {
                $output .= "### Data (SQL INSERT Statements)\n\n";
                $output .= "```sql\n";
                
                // Get column names
                $stmt = $db->query("DESCRIBE $table");
                $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $columnNames = array_column($columns, 'Field');
                
                // Fetch all rows in batches to avoid memory issues
                $batchSize = 1000;
                $offset = 0;
                $insertCount = 0;
                
                do {
                    $stmt = $db->prepare("SELECT * FROM $table LIMIT :offset, :limit");
                    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                    $stmt->bindValue(':limit', $batchSize, PDO::PARAM_INT);
                    $stmt->execute();
                    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    foreach ($rows as $row) {
                        $values = [];
                        foreach ($columnNames as $col) {
                            $value = $row[$col];
                            if ($value === null) {
                                $values[] = 'NULL';
                            } else {
                                // Escape single quotes and backslashes for SQL
                                $value = str_replace('\\', '\\\\', $value);
                                $value = str_replace("'", "\\'", $value);
                                $values[] = "'$value'";
                            }
                        }
                        $output .= "INSERT INTO `$table` (`" . implode('`, `', $columnNames) . "`) VALUES (" . implode(', ', $values) . ");\n";
                        $insertCount++;
                    }
                    
                    $offset += $batchSize;
                } while (count($rows) > 0);
                
                $output .= "\n-- Total INSERT statements: $insertCount\n";
                $output .= "```\n\n";
            }

        } catch (PDOException $e) {
            $output .= "### Error: " . $e->getMessage() . "\n\n";
        }

        $output .= "---\n\n";
    }

    // Dump views
    if (count($views) > 0) {
        $output .= "## Views\n\n";
        foreach ($views as $view) {
            $output .= "### View: `$view`\n\n";
            try {
                $stmt = $db->query("SHOW CREATE VIEW $view");
                $createStmt = $stmt->fetch(PDO::FETCH_ASSOC);
                $output .= "```sql\n";
                $output .= $createStmt['Create View'] ?? 'Unable to get view definition';
                $output .= "\n```\n\n";
            } catch (PDOException $e) {
                $output .= "Error: " . $e->getMessage() . "\n\n";
            }
        }
    }

    // Write to file
    $outputFile = __DIR__ . '/DATABASE_DUMP.md';
    file_put_contents($outputFile, $output);

    echo "\nDatabase dump completed successfully!\n";
    echo "Total tables: " . count($tables) . "\n";
    echo "Total views: " . count($views) . "\n";
    echo "Output saved to: $outputFile\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
