const db = require('../util/database');

module.exports = class User {
    constructor(id, Name, Email, PhoneNumber, Country, State, City, ZipCode, OTP, Designation) {
        this.id = id;
        this.Name = Name;
        this.Email = Email;
        this.PhoneNumber = PhoneNumber;
        this.Country = Country;
        this.City = City;
        this.ZipCode = ZipCode;
        this.OTP = OTP;
        this.Designation = Designation;
        this.State = State;
    }

    static async fetchAll() {
        try {
            return await db.execute('SELECT * FROM users');
        } catch (error) {
            throw new Error(`Error fetching all users: ${error.message}`);
        }
    }

    async save() {
        try {
            return await db.execute('INSERT INTO users (Name, PhoneNumber, Country, Email, State, City, Zipcode, OTP, Designation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [this.Name, this.PhoneNumber, this.Country, this.Email, this.State, this.City, this.ZipCode, this.OTP, this.Designation]);
        } catch (error) {
            throw new Error(`Error saving user: ${error.message}`);
        }
    }

    static async findByPhoneNumber(number) {
        try {
            return await db.execute('SELECT OTP FROM users WHERE PhoneNumber = ?', [number]);
        } catch (error) {
            throw new Error(`Error finding user by phone number: ${error.message}`);
        }
    }

    static async update_verify(number, Designation) {
        try {
            return await db.execute('UPDATE users SET Designation = ? WHERE PhoneNumber = ?', [`VERIFIED ${Designation}`, number]);
        } catch (error) {
            throw new Error(`Error updating user verification: ${error.message}`);
        }
    }

    static async getRecordByPhoneNumber(number) {
        try {
            return await db.execute('SELECT * FROM users WHERE PhoneNumber = ?', [number]);
        } catch (error) {
            throw new Error(`Error getting user record by phone number: ${error.message}`);
        }
    }

    static async check(userId, password) {
        try {
            return await db.execute('UPDATE users SET Designation = ? WHERE id = ? AND password = ?', [`VERIFIED ${Designation}`, userId, password]);
        } catch (error) {
            throw new Error(`Error checking user: ${error.message}`);
        }
    }

    static async updateOtp(phoneNumber, code) {
        try {
            return await db.execute('UPDATE users SET OTP = ? WHERE PhoneNumber = ?', [code, phoneNumber]);
        } catch (error) {
            throw new Error(`Error updating OTP: ${error.message}`);
        }
    }
};
