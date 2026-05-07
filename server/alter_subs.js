const pool = require('./db');

const alterTable = async () => {
    try {
        await pool.query(`
            ALTER TABLE submissions 
            ADD COLUMN IF NOT EXISTS advisor_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS advisor_email VARCHAR(255),
            ADD COLUMN IF NOT EXISTS advisor_is_author BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid',
            ADD COLUMN IF NOT EXISTS coauthors_list JSONB DEFAULT '[]'::jsonb;
        `);
        console.log("Таблица submissions успешно обновлена!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

alterTable();
