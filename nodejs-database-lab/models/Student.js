const { getSqlPool, sql } = require('../config/database');

class Student {
    // สร้างตาราง Students
    static async createTable() {
        try {
            const pool = getSqlPool();
            await pool.request().query(`
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Students' AND xtype='U')
                CREATE TABLE Students (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    firstName NVARCHAR(50) NOT NULL,
                    lastName NVARCHAR(50) NOT NULL,
                    email NVARCHAR(100),
                    age INT,
                    major NVARCHAR(100),
                    createdAt DATETIME2 DEFAULT GETDATE()
                )
            `);
            console.log('✅ Students table ready');
        } catch (error) {
            console.error('❌ Error creating Students table:', error.message);
            throw error;
        }
    }

    // ดึงข้อมูลทั้งหมด
    static async getAll() {
        try {
            const pool = getSqlPool();
            const result = await pool.request().query('SELECT * FROM Students ORDER BY id');
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    // ดึงข้อมูลตาม ID
    static async getById(id) {
        try {
            const pool = getSqlPool();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM Students WHERE id = @id');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    // เพิ่มข้อมูลใหม่
    static async create(studentData) {
        try {
            const pool = getSqlPool();
            const result = await pool.request()
                .input('firstName', sql.NVarChar(50), studentData.firstName)
                .input('lastName', sql.NVarChar(50), studentData.lastName)
                .input('email', sql.NVarChar(100), studentData.email)
                .input('age', sql.Int, studentData.age)
                .input('major', sql.NVarChar(100), studentData.major)
                .query(`
                    INSERT INTO Students (firstName, lastName, email, age, major)
                    OUTPUT INSERTED.*
                    VALUES (@firstName, @lastName, @email, @age, @major)
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    // อัพเดทข้อมูล
    static async update(id, studentData) {
        try {
            const pool = getSqlPool();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('firstName', sql.NVarChar(50), studentData.firstName)
                .input('lastName', sql.NVarChar(50), studentData.lastName)
                .input('email', sql.NVarChar(100), studentData.email)
                .input('age', sql.Int, studentData.age)
                .input('major', sql.NVarChar(100), studentData.major)
                .query(`
                    UPDATE Students SET 
                        firstName = @firstName,
                        lastName = @lastName,
                        email = @email,
                        age = @age,
                        major = @major
                    OUTPUT INSERTED.*
                    WHERE id = @id
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    // ลบข้อมูล
    static async delete(id) {
        try {
            const pool = getSqlPool();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Students WHERE id = @id');
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Student;