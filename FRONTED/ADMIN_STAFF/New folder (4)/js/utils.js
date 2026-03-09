/* =============================================
   VALIDATION UTILITIES
   Match backend validation rules from VALIDATION_REFERENCE.md
   All validation functions return { valid: boolean, message: string }
   ============================================= */

const ValidationUtils = {
    /* ========== STRING VALIDATION ========== */

    /**
     * Validate string length
     * Backend rule: Name 1-100, Username 3-50, Description 0-1000, etc.
     */
    validateStringLength: (value, min, max, fieldName = 'Field') => {
        if (value === null || value === undefined) {
            value = '';
        }
        const str = String(value).trim();
        const length = str.length;

        if (length < min) {
            return {
                valid: false,
                message: `${fieldName} must be at least ${min} character${min > 1 ? 's' : ''}`
            };
        }
        if (length > max) {
            return {
                valid: false,
                message: `${fieldName} cannot exceed ${max} character${max > 1 ? 's' : ''}`
            };
        }
        return { valid: true, message: '' };
    },

    /**
     * Validate name (1-100 characters)
     */
    validateName: (value) => {
        return ValidationUtils.validateStringLength(value, 1, 100, 'Name');
    },

    /**
     * Validate username (3-50 characters)
     */
    validateUsername: (value) => {
        return ValidationUtils.validateStringLength(value, 3, 50, 'Username');
    },

    /**
     * Validate description (0-1000 characters)
     */
    validateDescription: (value) => {
        return ValidationUtils.validateStringLength(value, 0, 1000, 'Description');
    },

    /**
     * Validate address (5-500 characters)
     */
    validateAddress: (value) => {
        return ValidationUtils.validateStringLength(value, 5, 500, 'Address');
    },

    /**
     * Validate notes/remarks (0-500 characters)
     */
    validateNotes: (value, fieldName = 'Notes') => {
        return ValidationUtils.validateStringLength(value, 0, 500, fieldName);
    },

    /**
     * Validate specialization (0-100 characters)
     */
    validateSpecialization: (value) => {
        return ValidationUtils.validateStringLength(value, 0, 100, 'Specialization');
    },

    /**
     * Validate brand (0-100 characters)
     */
    validateBrand: (value) => {
        return ValidationUtils.validateStringLength(value, 0, 100, 'Brand');
    },

    /**
     * Validate transaction reference (0-100 characters)
     */
    validateTransactionReference: (value) => {
        return ValidationUtils.validateStringLength(value, 0, 100, 'Transaction reference');
    },

    /* ========== EMAIL & PHONE VALIDATION ========== */

    /**
     * Validate email format (RFC 5322 simplified)
     * Backend rule: Valid email format
     */
    validateEmail: (value) => {
        if (!value || value.trim() === '') {
            return { valid: true, message: '' }; // Empty is OK (optional field)
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const email = value.trim();

        if (!emailRegex.test(email)) {
            return {
                valid: false,
                message: 'Invalid email format'
            };
        }
        return { valid: true, message: '' };
    },

    /**
     * Validate required email format
     */
    validateRequiredEmail: (value) => {
        if (!value || value.trim() === '') {
            return {
                valid: false,
                message: 'Email is required'
            };
        }
        return ValidationUtils.validateEmail(value);
    },

    /**
     * Validate Indian phone number (10 digits, starts with 6-9)
     * Backend rule: ^[6-9][0-9]{9}$
     */
    validatePhone: (value) => {
        if (!value || value.trim() === '') {
            return { valid: true, message: '' }; // Empty is OK (optional field)
        }
        const phoneRegex = /^[6-9][0-9]{9}$/;
        const phone = value.trim().replace(/[\s\-\(\)]/g, '');

        if (!phoneRegex.test(phone)) {
            return {
                valid: false,
                message: 'Invalid phone number (10-digit Indian format required, must start with 6-9)'
            };
        }
        return { valid: true, message: '' };
    },

    /**
     * Validate required phone number
     */
    validateRequiredPhone: (value) => {
        if (!value || value.trim() === '') {
            return {
                valid: false,
                message: 'Phone number is required'
            };
        }
        return ValidationUtils.validatePhone(value);
    },

    /**
     * Validate phone OR email (at least one required)
     * Backend rule: Conditional - required if other is not provided
     */
    validatePhoneOrEmail: (phone, email) => {
        const hasPhone = phone && phone.trim() !== '';
        const hasEmail = email && email.trim() !== '';

        if (!hasPhone && !hasEmail) {
            return {
                valid: false,
                message: 'Phone number or email is required (at least one)'
            };
        }

        if (hasPhone) {
            const phoneValidation = ValidationUtils.validatePhone(phone);
            if (!phoneValidation.valid) {
                return phoneValidation;
            }
        }

        if (hasEmail) {
            const emailValidation = ValidationUtils.validateEmail(email);
            if (!emailValidation.valid) {
                return emailValidation;
            }
        }

        return { valid: true, message: '' };
    },

    /* ========== NUMERIC VALIDATION ========== */

    /**
     * Validate number range
     */
    validateNumberRange: (value, min, max, fieldName = 'Value', allowDecimal = true) => {
        const num = allowDecimal ? parseFloat(value) : parseInt(value);

        if (isNaN(num)) {
            return {
                valid: false,
                message: `${fieldName} must be a valid number`
            };
        }
        if (num < min) {
            return {
                valid: false,
                message: `${fieldName} must be at least ${min}`
            };
        }
        if (num > max) {
            return {
                valid: false,
                message: `${fieldName} cannot exceed ${max}`
            };
        }
        return { valid: true, message: '' };
    },

    /**
     * Validate price/amount (0 - 1,000,000)
     * Backend rule: 0 - 10,000,000 for most amounts
     */
    validatePrice: (value, max = 10000000, fieldName = 'Amount') => {
        return ValidationUtils.validateNumberRange(value, 0, max, fieldName, true);
    },

    /**
     * Validate required price (must be > 0)
     */
    validateRequiredPrice: (value, max = 10000000, fieldName = 'Amount') => {
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) {
            return {
                valid: false,
                message: `${fieldName} is required and must be greater than 0`
            };
        }
        return ValidationUtils.validatePrice(value, max, fieldName);
    },

    /**
     * Validate payment amount (0.01 - 10,000,000)
     * Backend rule: 0.01 - 10,000,000
     */
    validatePaymentAmount: (value, max = 10000000) => {
        return ValidationUtils.validateNumberRange(value, 0.01, max, 'Payment amount', true);
    },

    /**
     * Validate duration (1 - 1440 minutes)
     * Backend rule: 1 - 1440 minutes (max 24 hours)
     */
    validateDuration: (value) => {
        return ValidationUtils.validateNumberRange(value, 1, 1440, 'Duration', false);
    },

    /**
     * Validate quantity (0 - 10,000)
     * Backend rule: 0 - 10,000
     */
    validateQuantity: (value, fieldName = 'Quantity') => {
        return ValidationUtils.validateNumberRange(value, 0, 10000, fieldName, false);
    },

    /**
     * Validate required quantity (1 - 10,000)
     */
    validateRequiredQuantity: (value, fieldName = 'Quantity') => {
        return ValidationUtils.validateNumberRange(value, 1, 10000, fieldName, false);
    },

    /**
     * Validate validity days (1 - 365)
     * Backend rule: 1 - 365 days
     */
    validateValidityDays: (value) => {
        return ValidationUtils.validateNumberRange(value, 1, 365, 'Validity days', false);
    },

    /**
     * Validate experience years (0 - 50)
     * Backend rule: 0 - 50
     */
    validateExperienceYears: (value) => {
        return ValidationUtils.validateNumberRange(value, 0, 50, 'Experience years', false);
    },

    /**
     * Validate percentage/rate (0 - 100)
     * Backend rule: 0 - 100
     */
    validatePercentage: (value, fieldName = 'Percentage') => {
        return ValidationUtils.validateNumberRange(value, 0, 100, fieldName, true);
    },

    /**
     * Validate rating (1 - 5)
     * Backend rule: 1 - 5
     */
    validateRating: (value) => {
        return ValidationUtils.validateNumberRange(value, 1, 5, 'Rating', false);
    },

    /**
     * Validate tax rate (0 - 100)
     * Backend rule: 0 - 100 percentage
     */
    validateTaxRate: (value) => {
        return ValidationUtils.validateNumberRange(value, 0, 100, 'Tax rate', true);
    },

    /**
     * Validate discount (0 - totalAmount)
     * Backend rule: 0 - ≤ Total Amount
     */
    validateDiscount: (value, totalAmount, fieldName = 'Discount') => {
        const discount = parseFloat(value);
        if (isNaN(discount)) {
            return {
                valid: false,
                message: `${fieldName} must be a valid number`
            };
        }
        if (discount < 0) {
            return {
                valid: false,
                message: `${fieldName} cannot be negative`
            };
        }
        if (discount > totalAmount) {
            return {
                valid: false,
                message: `${fieldName} cannot exceed ${fieldName === 'Discount' ? 'subtotal' : 'total amount'}`
            };
        }
        return { valid: true, message: '' };
    },

    /* ========== DATE & TIME VALIDATION ========== */

    /**
     * Validate date format (YYYY-MM-DD)
     * Backend rule: ^\d{4}-\d{2}-\d{2}$
     */
    validateDateFormat: (value) => {
        if (!value || value.trim() === '') {
            return { valid: true, message: '' }; // Empty is OK (optional field)
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const date = value.trim();

        if (!dateRegex.test(date)) {
            return {
                valid: false,
                message: 'Invalid date format (use YYYY-MM-DD)'
            };
        }

        // Check if it's a valid date
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            return {
                valid: false,
                message: 'Invalid date'
            };
        }

        return { valid: true, message: '' };
    },

    /**
     * Validate required date format (YYYY-MM-DD)
     */
    validateRequiredDate: (value) => {
        if (!value || value.trim() === '') {
            return {
                valid: false,
                message: 'Date is required'
            };
        }
        return ValidationUtils.validateDateFormat(value);
    },

    /**
     * Validate date is not in the past
     * Backend rule: Cannot book appointments in the past
     */
    validateDateNotInPast: (value, fieldName = 'Date') => {
        if (!value || value.trim() === '') {
            return { valid: true, message: '' };
        }
        const inputDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (inputDate < today) {
            return {
                valid: false,
                message: `Cannot ${fieldName} in the past`
            };
        }
        return { valid: true, message: '' };
    },

    /**
     * Validate end date >= start date
     */
    validateEndDate: (endDate, startDate, fieldName = 'End date') => {
        if (!endDate || !startDate) {
            return { valid: true, message: '' };
        }
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            return {
                valid: false,
                message: `${fieldName} must be on or after start date`
            };
        }
        return { valid: true, message: '' };
    },

    /**
     * Validate time format (HH:MM:SS)
     * Backend rule: ^\d{2}:\d{2}:\d{2}$
     */
    validateTimeFormat: (value) => {
        if (!value || value.trim() === '') {
            return { valid: true, message: '' }; // Empty is OK (optional field)
        }
        const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
        const time = value.trim();

        if (!timeRegex.test(time)) {
            return {
                valid: false,
                message: 'Invalid time format (use HH:MM:SS)'
            };
        }
        return { valid: true, message: '' };
    },

    /**
     * Validate required time format (HH:MM:SS)
     */
    validateRequiredTime: (value) => {
        if (!value || value.trim() === '') {
            return {
                valid: false,
                message: 'Time is required'
            };
        }
        return ValidationUtils.validateTimeFormat(value);
    },

    /* ========== ENUM VALIDATION ========== */

    /**
     * Validate enum value
     */
    validateEnum: (value, allowedValues, fieldName = 'Value') => {
        if (!value || value.trim() === '') {
            return { valid: true, message: '' }; // Empty is OK (optional field)
        }
        const val = String(value).trim().toUpperCase();

        if (!allowedValues.includes(val)) {
            return {
                valid: false,
                message: `Invalid ${fieldName.toLowerCase()}. Must be one of: ${allowedValues.join(', ')}`
            };
        }
        return { valid: true, message: '' };
    },

    /**
     * Validate gender enum (MALE, FEMALE, OTHER)
     */
    validateGender: (value) => {
        return ValidationUtils.validateEnum(value, ['MALE', 'FEMALE', 'OTHER'], 'Gender');
    },

    /**
     * Validate status enum (varies by context)
     */
    validateStatus: (value, allowedStatuses, fieldName = 'Status') => {
        return ValidationUtils.validateEnum(value, allowedStatuses, fieldName);
    },

    /**
     * Validate customer status (ACTIVE, INACTIVE, BLOCKED)
     */
    validateCustomerStatus: (value) => {
        return ValidationUtils.validateStatus(value, ['ACTIVE', 'INACTIVE', 'BLOCKED'], 'Customer status');
    },

    /**
     * Validate staff status (ACTIVE, INACTIVE, ON_LEAVE, TERMINATED)
     */
    validateStaffStatus: (value) => {
        return ValidationUtils.validateStatus(value, ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'], 'Staff status');
    },

    /**
     * Validate service/package status (ACTIVE, INACTIVE)
     */
    validateServiceStatus: (value) => {
        return ValidationUtils.validateStatus(value, ['ACTIVE', 'INACTIVE'], 'Status');
    },

    /**
     * Validate appointment status
     */
    validateAppointmentStatus: (value) => {
        return ValidationUtils.validateStatus(
            value,
            ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
            'Appointment status'
        );
    },

    /**
     * Validate payment status
     */
    validatePaymentStatus: (value) => {
        return ValidationUtils.validateStatus(
            value,
            ['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED'],
            'Payment status'
        );
    },

    /**
     * Validate payment mode
     */
    validatePaymentMode: (value) => {
        return ValidationUtils.validateStatus(
            value,
            ['CASH', 'CARD', 'UPI', 'NET_BANKING', 'WALLET', 'CHEQUE', 'BANK'],
            'Payment mode'
        );
    },

    /**
     * Validate incentive type
     */
    validateIncentiveType: (value) => {
        return ValidationUtils.validateStatus(
            value,
            ['SERVICE_COMMISSION', 'BONUS', 'TARGET_ACHIEVEMENT'],
            'Incentive type'
        );
    },

    /**
     * Validate calculation type
     */
    validateCalculationType: (value) => {
        return ValidationUtils.validateStatus(
            value,
            ['FIXED', 'PERCENTAGE'],
            'Calculation type'
        );
    },

    /**
     * Validate transaction type
     */
    validateTransactionType: (value) => {
        return ValidationUtils.validateStatus(
            value,
            ['IN', 'OUT', 'ADJUSTMENT'],
            'Transaction type'
        );
    },

    /**
     * Validate product category
     */
    validateProductCategory: (value) => {
        return ValidationUtils.validateStatus(
            value,
            ['product', 'equipment'],
            'Category'
        );
    },

    /**
     * Validate role enum
     */
    validateRole: (value) => {
        return ValidationUtils.validateStatus(
            value,
            ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'CUSTOMER'],
            'Role'
        );
    },

    /* ========== ARRAY VALIDATION ========== */

    /**
     * Validate array is not empty
     */
    validateNonEmptyArray: (value, fieldName = 'Items') => {
        if (!Array.isArray(value) || value.length === 0) {
            return {
                valid: false,
                message: `${fieldName} cannot be empty`
            };
        }
        return { valid: true, message: '' };
    },

    /**
     * Validate array has no duplicates
     */
    validateNoDuplicates: (value, fieldName = 'Items') => {
        if (!Array.isArray(value)) {
            return {
                valid: false,
                message: `${fieldName} must be an array`
            };
        }
        const unique = new Set(value);
        if (unique.size !== value.length) {
            return {
                valid: false,
                message: `${fieldName} cannot contain duplicates`
            };
        }
        return { valid: true, message: '' };
    },

    /**
     * Validate service IDs array (integers, no duplicates)
     */
    validateServiceIds: (value) => {
        if (!Array.isArray(value) || value.length === 0) {
            return {
                valid: false,
                message: 'At least one service is required'
            };
        }
        for (let i = 0; i < value.length; i++) {
            const id = value[i];
            if (!Number.isInteger(id) || id <= 0) {
                return {
                    valid: false,
                    message: 'All service IDs must be valid positive integers'
                };
            }
        }
        return ValidationUtils.validateNoDuplicates(value, 'Service IDs');
    },

    /* ========== URL VALIDATION ========== */

    /**
     * Validate URL format
     */
    validateUrl: (value) => {
        if (!value || value.trim() === '') {
            return { valid: true, message: '' }; // Empty is OK (optional field)
        }
        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        const url = value.trim();

        if (!urlRegex.test(url)) {
            return {
                valid: false,
                message: 'Invalid URL format'
            };
        }
        return { valid: true, message: '' };
    },

    /* ========== COMPOSITE VALIDATORS ========== */

    /**
     * Validate customer data (complete validation before create/update)
     */
    validateCustomerData: (data, isUpdate = false) => {
        const errors = [];

        // Name validation (required, 1-100 chars)
        if (!isUpdate || data.name !== undefined) {
            const nameValidation = ValidationUtils.validateName(data.name);
            if (!nameValidation.valid) errors.push(nameValidation.message);
        }

        // Phone OR email required
        const phone = data.phone || '';
        const email = data.email || '';
        const phoneOrEmailValidation = ValidationUtils.validatePhoneOrEmail(phone, email);
        if (!phoneOrEmailValidation.valid) errors.push(phoneOrEmailValidation.message);

        // Gender validation (optional, but must be valid if provided)
        if (data.gender) {
            const genderValidation = ValidationUtils.validateGender(data.gender);
            if (!genderValidation.valid) errors.push(genderValidation.message);
        }

        // Date of birth validation (optional, but must be valid if provided)
        if (data.date_of_birth) {
            const dobValidation = ValidationUtils.validateDateFormat(data.date_of_birth);
            if (!dobValidation.valid) errors.push(dobValidation.message);
        }

        // Anniversary date validation (optional, but must be valid if provided)
        if (data.anniversary_date) {
            const anniversaryValidation = ValidationUtils.validateDateFormat(data.anniversary_date);
            if (!anniversaryValidation.valid) errors.push(anniversaryValidation.message);
        }

        // Address validation (optional, but must be valid if provided)
        if (data.address) {
            const addressValidation = ValidationUtils.validateAddress(data.address);
            if (!addressValidation.valid) errors.push(addressValidation.message);
        }

        // Preferences validation (optional, but must be valid if provided)
        if (data.preferences) {
            const preferencesValidation = ValidationUtils.validateNotes(data.preferences, 'Preferences');
            if (!preferencesValidation.valid) errors.push(preferencesValidation.message);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate service data (complete validation before create/update)
     */
    validateServiceData: (data, isUpdate = false) => {
        const errors = [];

        // Service name validation (required, 1-100 chars)
        if (!isUpdate || data.service_name !== undefined) {
            const nameValidation = ValidationUtils.validateStringLength(
                data.service_name, 1, 100, 'Service name'
            );
            if (!nameValidation.valid) errors.push(nameValidation.message);
        }

        // Description validation (optional, max 1000 chars)
        if (data.description) {
            const descValidation = ValidationUtils.validateDescription(data.description);
            if (!descValidation.valid) errors.push(descValidation.message);
        }

        // Price validation (required, 0-1,000,000)
        if (!isUpdate || data.price !== undefined) {
            const priceValidation = ValidationUtils.validateRequiredPrice(data.price, 1000000, 'Price');
            if (!priceValidation.valid) errors.push(priceValidation.message);
        }

        // Duration validation (required, 1-1440 min)
        if (!isUpdate || data.duration !== undefined) {
            const durationValidation = ValidationUtils.validateDuration(data.duration);
            if (!durationValidation.valid) errors.push(durationValidation.message);
        }

        // Image URL validation (optional)
        if (data.image_url) {
            const urlValidation = ValidationUtils.validateUrl(data.image_url);
            if (!urlValidation.valid) errors.push(urlValidation.message);
        }

        // Status validation (optional, but must be valid if provided)
        if (data.status) {
            const statusValidation = ValidationUtils.validateServiceStatus(data.status);
            if (!statusValidation.valid) errors.push(statusValidation.message);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate package data (complete validation before create/update)
     */
    validatePackageData: (data, isUpdate = false) => {
        const errors = [];

        // Package name validation (required, 1-100 chars)
        if (!isUpdate || data.package_name !== undefined) {
            const nameValidation = ValidationUtils.validateStringLength(
                data.package_name, 1, 100, 'Package name'
            );
            if (!nameValidation.valid) errors.push(nameValidation.message);
        }

        // Description validation (optional, max 1000 chars)
        if (data.description) {
            const descValidation = ValidationUtils.validateDescription(data.description);
            if (!descValidation.valid) errors.push(descValidation.message);
        }

        // Total price validation (required, 0-1,000,000)
        if (!isUpdate || data.total_price !== undefined) {
            const priceValidation = ValidationUtils.validateRequiredPrice(
                data.total_price, 1000000, 'Total price'
            );
            if (!priceValidation.valid) errors.push(priceValidation.message);
        }

        // Validity days validation (optional, 1-365)
        if (data.validity_days) {
            const validityValidation = ValidationUtils.validateValidityDays(data.validity_days);
            if (!validityValidation.valid) errors.push(validityValidation.message);
        }

        // Status validation (optional, but must be valid if provided)
        if (data.status) {
            const statusValidation = ValidationUtils.validateServiceStatus(data.status);
            if (!statusValidation.valid) errors.push(statusValidation.message);
        }

        // Service IDs validation (required, array of integers, no duplicates)
        if (!isUpdate || data.service_ids !== undefined) {
            const servicesValidation = ValidationUtils.validateServiceIds(data.service_ids);
            if (!servicesValidation.valid) errors.push(servicesValidation.message);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate staff data (complete validation before create/update)
     */
    validateStaffData: (data, isUpdate = false) => {
        const errors = [];

        // Username validation (required for create, 3-50 chars)
        if (!isUpdate || data.username !== undefined) {
            const usernameValidation = ValidationUtils.validateUsername(data.username);
            if (!usernameValidation.valid) errors.push(usernameValidation.message);
        }

        // Email validation (required, valid format)
        if (!isUpdate || data.email !== undefined) {
            const emailValidation = ValidationUtils.validateRequiredEmail(data.email);
            if (!emailValidation.valid) errors.push(emailValidation.message);
        }

        // Password validation (required for create, min 6 chars)
        if (!isUpdate || data.password !== undefined) {
            if (!data.password || data.password.length < 6) {
                errors.push('Password must be at least 6 characters');
            }
        }

        // Name validation (required, 1-100 chars)
        if (!isUpdate || data.name !== undefined) {
            const nameValidation = ValidationUtils.validateName(data.name);
            if (!nameValidation.valid) errors.push(nameValidation.message);
        }

        // Role validation (required, ADMIN or STAFF)
        if (!isUpdate || data.role !== undefined) {
            const roleValidation = ValidationUtils.validateEnum(
                data.role, ['ADMIN', 'STAFF'], 'Role'
            );
            if (!roleValidation.valid) errors.push(roleValidation.message);
        }

        // Phone validation (optional, but must be valid if provided)
        if (data.phone) {
            const phoneValidation = ValidationUtils.validatePhone(data.phone);
            if (!phoneValidation.valid) errors.push(phoneValidation.message);
        }

        // Status validation (optional, but must be valid if provided)
        if (data.status) {
            const statusValidation = ValidationUtils.validateStaffStatus(data.status);
            if (!statusValidation.valid) errors.push(statusValidation.message);
        }

        // Date of birth validation (optional)
        if (data.date_of_birth) {
            const dobValidation = ValidationUtils.validateDateFormat(data.date_of_birth);
            if (!dobValidation.valid) errors.push(dobValidation.message);
        }

        // Date of joining validation (optional)
        if (data.date_of_joining) {
            const joiningValidation = ValidationUtils.validateDateFormat(data.date_of_joining);
            if (!joiningValidation.valid) errors.push(joiningValidation.message);
        }

        // Specialization validation (optional, max 100 chars)
        if (data.specialization) {
            const specValidation = ValidationUtils.validateSpecialization(data.specialization);
            if (!specValidation.valid) errors.push(specValidation.message);
        }

        // Experience years validation (optional, 0-50)
        if (data.experience_years !== undefined && data.experience_years !== null) {
            const expValidation = ValidationUtils.validateExperienceYears(data.experience_years);
            if (!expValidation.valid) errors.push(expValidation.message);
        }

        // Salary validation (optional, >= 0)
        if (data.salary !== undefined && data.salary !== null) {
            const salaryValidation = ValidationUtils.validateNumberRange(
                data.salary, 0, Number.MAX_SAFE_INTEGER, 'Salary', true
            );
            if (!salaryValidation.valid) errors.push(salaryValidation.message);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate appointment data (complete validation before create)
     */
    validateAppointmentData: (data) => {
        const errors = [];

        // Customer ID validation (required for ADMIN/STAFF)
        if (!data.customer_id || parseInt(data.customer_id) <= 0) {
            errors.push('Customer ID is required');
        }

        // Appointment date validation (required, YYYY-MM-DD, not in past)
        const dateValidation = ValidationUtils.validateRequiredDate(data.appointment_date);
        if (!dateValidation.valid) errors.push(dateValidation.message);
        else {
            const pastValidation = ValidationUtils.validateDateNotInPast(
                data.appointment_date, 'book appointment'
            );
            if (!pastValidation.valid) errors.push(pastValidation.message);
        }

        // Start time validation (required, HH:MM:SS)
        const timeValidation = ValidationUtils.validateRequiredTime(data.start_time);
        if (!timeValidation.valid) errors.push(timeValidation.message);
        else {
            const formatValidation = ValidationUtils.validateTimeFormat(data.start_time);
            if (!formatValidation.valid) errors.push(formatValidation.message);
        }

        // Estimated duration validation (1-1440 min)
        if (data.estimated_duration) {
            const durationValidation = ValidationUtils.validateDuration(data.estimated_duration);
            if (!durationValidation.valid) errors.push(durationValidation.message);
        }

        // Services OR packages required
        const hasServices = Array.isArray(data.services) && data.services.length > 0;
        const hasPackages = Array.isArray(data.packages) && data.packages.length > 0;

        if (!hasServices && !hasPackages) {
            errors.push('At least one service or package is required');
        }

        // Validate services array if provided
        if (hasServices) {
            for (let i = 0; i < data.services.length; i++) {
                const service = data.services[i];
                if (!service.service_id || parseInt(service.service_id) <= 0) {
                    errors.push(`Invalid service ID at position ${i + 1}`);
                }
                if (service.discount_amount !== undefined) {
                    const discountValidation = ValidationUtils.validateDiscount(
                        service.discount_amount, service.price || 0, 'Service discount'
                    );
                    if (!discountValidation.valid) errors.push(discountValidation.message);
                }
            }
        }

        // Validate packages array if provided
        if (hasPackages) {
            for (let i = 0; i < data.packages.length; i++) {
                const pkg = data.packages[i];
                if (!pkg.package_id || parseInt(pkg.package_id) <= 0) {
                    errors.push(`Invalid package ID at position ${i + 1}`);
                }
                if (pkg.discount_amount !== undefined) {
                    const discountValidation = ValidationUtils.validateDiscount(
                        pkg.discount_amount, pkg.price || 0, 'Package discount'
                    );
                    if (!discountValidation.valid) errors.push(discountValidation.message);
                }
            }
        }

        // Discount amount validation (0 - total_amount)
        if (data.discount_amount !== undefined && data.discount_amount !== null) {
            const totalAmount = data.final_amount || data.total_amount || 0;
            const discountValidation = ValidationUtils.validateDiscount(
                data.discount_amount, totalAmount, 'Discount'
            );
            if (!discountValidation.valid) errors.push(discountValidation.message);
        }

        // Notes validation (optional, max 500 chars)
        if (data.notes) {
            const notesValidation = ValidationUtils.validateNotes(data.notes, 'Notes');
            if (!notesValidation.valid) errors.push(notesValidation.message);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate invoice data (complete validation before create)
     */
    validateInvoiceData: (data) => {
        const errors = [];

        // Appointment ID validation (required)
        if (!data.appointment_id || parseInt(data.appointment_id) <= 0) {
            errors.push('Appointment ID is required');
        }

        // Subtotal validation (0-10,000,000)
        if (data.subtotal_amount !== undefined && data.subtotal_amount !== null) {
            const subtotalValidation = ValidationUtils.validatePrice(
                data.subtotal_amount, 10000000, 'Subtotal amount'
            );
            if (!subtotalValidation.valid) errors.push(subtotalValidation.message);
        }

        // Tax amount validation (0-1,000,000)
        if (data.tax_amount !== undefined && data.tax_amount !== null) {
            const taxValidation = ValidationUtils.validatePrice(
                data.tax_amount, 1000000, 'Tax amount'
            );
            if (!taxValidation.valid) errors.push(taxValidation.message);
        }

        // Discount amount validation (0 - subtotal)
        if (data.discount_amount !== undefined && data.discount_amount !== null) {
            const subtotal = data.subtotal_amount || 0;
            const discountValidation = ValidationUtils.validateDiscount(
                data.discount_amount, subtotal, 'Discount'
            );
            if (!discountValidation.valid) errors.push(discountValidation.message);
        }

        // Due date validation (optional, YYYY-MM-DD)
        if (data.due_date) {
            const dueDateValidation = ValidationUtils.validateDateFormat(data.due_date);
            if (!dueDateValidation.valid) errors.push(dueDateValidation.message);
        }

        // Notes validation (optional, max 500 chars)
        if (data.notes) {
            const notesValidation = ValidationUtils.validateNotes(data.notes, 'Notes');
            if (!notesValidation.valid) errors.push(notesValidation.message);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate payment data (complete validation before create)
     */
    validatePaymentData: (data, outstandingAmount = 0) => {
        const errors = [];

        // Payment amount validation (0.01-10,000,000, must be <= outstanding)
        const amountValidation = ValidationUtils.validatePaymentAmount(data.amount, 10000000);
        if (!amountValidation.valid) errors.push(amountValidation.message);
        else if (parseFloat(data.amount) > outstandingAmount) {
            errors.push(`Payment amount cannot exceed outstanding balance (₹${outstandingAmount.toFixed(2)})`);
        }

        // Payment mode validation (required, enum)
        const modeValidation = ValidationUtils.validatePaymentMode(data.payment_mode);
        if (!modeValidation.valid) errors.push(modeValidation.message);

        // Payment date validation (optional, YYYY-MM-DD HH:MM:SS)
        if (data.payment_date) {
            // Backend expects: YYYY-MM-DD HH:MM:SS
            const dateTimeRegex = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/;
            if (!dateTimeRegex.test(data.payment_date)) {
                errors.push('Invalid payment date format (use YYYY-MM-DD or YYYY-MM-DD HH:MM:SS)');
            }
        }

        // Transaction number validation (optional, max 100 chars)
        if (data.transaction_no) {
            const txnValidation = ValidationUtils.validateTransactionReference(data.transaction_no);
            if (!txnValidation.valid) errors.push(txnValidation.message);
        }

        // Remarks validation (optional, max 500 chars)
        if (data.remarks) {
            const remarksValidation = ValidationUtils.validateNotes(data.remarks, 'Remarks');
            if (!remarksValidation.valid) errors.push(remarksValidation.message);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate incentive data (complete validation before create)
     */
    validateIncentiveData: (data) => {
        const errors = [];

        // Staff ID validation (required)
        if (!data.staff_id || parseInt(data.staff_id) <= 0) {
            errors.push('Staff ID is required');
        }

        // Incentive type validation (required, enum)
        const typeValidation = ValidationUtils.validateIncentiveType(data.incentive_type);
        if (!typeValidation.valid) errors.push(typeValidation.message);

        // Appointment ID validation (required for SERVICE_COMMISSION)
        if (data.incentive_type === 'SERVICE_COMMISSION' && data.appointment_id) {
            if (parseInt(data.appointment_id) <= 0) {
                errors.push('Invalid appointment ID');
            }
        }

        // Calculation type validation (optional, FIXED or PERCENTAGE)
        if (data.calculation_type) {
            const calcValidation = ValidationUtils.validateCalculationType(data.calculation_type);
            if (!calcValidation.valid) errors.push(calcValidation.message);
        }

        // Percentage rate validation (0-100, required if PERCENTAGE)
        if (data.calculation_type === 'PERCENTAGE') {
            if (data.percentage_rate === undefined || data.percentage_rate === null) {
                errors.push('Percentage rate is required when calculation type is PERCENTAGE');
            } else {
                const pctValidation = ValidationUtils.validatePercentage(data.percentage_rate);
                if (!pctValidation.valid) errors.push(pctValidation.message);
            }

            // Base amount required for PERCENTAGE
            if (data.base_amount === undefined || data.base_amount === null) {
                errors.push('Base amount is required when calculation type is PERCENTAGE');
            } else {
                const baseValidation = ValidationUtils.validateNumberRange(
                    data.base_amount, 0, Number.MAX_SAFE_INTEGER, 'Base amount', true
                );
                if (!baseValidation.valid) errors.push(baseValidation.message);
            }
        }

        // Fixed amount validation (>= 0, required if FIXED)
        if (!data.calculation_type || data.calculation_type === 'FIXED') {
            if (data.fixed_amount === undefined || data.fixed_amount === null) {
                errors.push('Fixed amount is required when calculation type is FIXED');
            } else {
                const fixedValidation = ValidationUtils.validateNumberRange(
                    data.fixed_amount, 0, Number.MAX_SAFE_INTEGER, 'Fixed amount', true
                );
                if (!fixedValidation.valid) errors.push(fixedValidation.message);
            }
        }

        // Incentive amount validation (required, 0-1,000,000)
        if (data.incentive_amount === undefined || data.incentive_amount === null) {
            errors.push('Incentive amount is required');
        } else {
            const amountValidation = ValidationUtils.validateRequiredPrice(
                data.incentive_amount, 1000000, 'Incentive amount'
            );
            if (!amountValidation.valid) errors.push(amountValidation.message);
        }

        // Remarks validation (optional, max 500 chars)
        if (data.remarks) {
            const remarksValidation = ValidationUtils.validateNotes(data.remarks, 'Remarks');
            if (!remarksValidation.valid) errors.push(remarksValidation.message);
        }

        // Status validation (optional)
        if (data.status) {
            const statusValidation = ValidationUtils.validateEnum(
                data.status, ['PENDING', 'APPROVED', 'PAID'], 'Status'
            );
            if (!statusValidation.valid) errors.push(statusValidation.message);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate payout data (complete validation before create)
     */
    validatePayoutData: (data) => {
        const errors = [];

        // Payout amount validation (required, 0-1,000,000)
        if (data.payout_amount === undefined || data.payout_amount === null) {
            errors.push('Payout amount is required');
        } else {
            const amountValidation = ValidationUtils.validateRequiredPrice(
                data.payout_amount, 1000000, 'Payout amount'
            );
            if (!amountValidation.valid) errors.push(amountValidation.message);
        }

        // Payment mode validation (required, enum)
        const modeValidation = ValidationUtils.validateEnum(
            data.payment_mode, ['CASH', 'UPI', 'BANK', 'CHEQUE'], 'Payment mode'
        );
        if (!modeValidation.valid) errors.push(modeValidation.message);

        // Payout date validation (optional, YYYY-MM-DD)
        if (data.payout_date) {
            const dateValidation = ValidationUtils.validateDateFormat(data.payout_date);
            if (!dateValidation.valid) errors.push(dateValidation.message);
        }

        // Transaction reference validation (optional, max 100 chars)
        if (data.transaction_reference) {
            const txnValidation = ValidationUtils.validateTransactionReference(data.transaction_reference);
            if (!txnValidation.valid) errors.push(txnValidation.message);
        }

        // Remarks validation (optional, max 500 chars)
        if (data.remarks) {
            const remarksValidation = ValidationUtils.validateNotes(data.remarks, 'Remarks');
            if (!remarksValidation.valid) errors.push(remarksValidation.message);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate stock transaction data (complete validation before create)
     */
    validateTransactionData: (data) => {
        const errors = [];

        // Product ID validation (required)
        if (!data.product_id || parseInt(data.product_id) <= 0) {
            errors.push('Product ID is required');
        }

        // Transaction type validation (required, enum)
        const typeValidation = ValidationUtils.validateTransactionType(data.transaction_type);
        if (!typeValidation.valid) errors.push(typeValidation.message);

        // Quantity validation (required, 1-10,000)
        if (data.quantity === undefined || data.quantity === null) {
            errors.push('Quantity is required');
        } else {
            const qtyValidation = ValidationUtils.validateRequiredQuantity(data.quantity);
            if (!qtyValidation.valid) errors.push(qtyValidation.message);
        }

        // Unit price validation (optional, 0-1,000,000)
        if (data.unit_price !== undefined && data.unit_price !== null) {
            const priceValidation = ValidationUtils.validatePrice(
                data.unit_price, 1000000, 'Unit price'
            );
            if (!priceValidation.valid) errors.push(priceValidation.message);
        }

        // Notes validation (optional, max 500 chars)
        if (data.notes) {
            const notesValidation = ValidationUtils.validateNotes(data.notes, 'Notes');
            if (!notesValidation.valid) errors.push(notesValidation.message);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate product data (complete validation before create/update)
     */
    validateProductData: (data, isUpdate = false) => {
        const errors = [];

        // Product name validation (required, 1-100 chars)
        if (!isUpdate || data.product_name !== undefined) {
            const nameValidation = ValidationUtils.validateStringLength(
                data.product_name, 1, 100, 'Product name'
            );
            if (!nameValidation.valid) errors.push(nameValidation.message);
        }

        // Brand validation (optional, max 100 chars)
        if (data.brand) {
            const brandValidation = ValidationUtils.validateBrand(data.brand);
            if (!brandValidation.valid) errors.push(brandValidation.message);
        }

        // Category validation (required, product or equipment)
        if (!isUpdate || data.category !== undefined) {
            const categoryValidation = ValidationUtils.validateProductCategory(data.category);
            if (!categoryValidation.valid) errors.push(categoryValidation.message);
        }

        // Description validation (optional, max 1000 chars)
        if (data.description) {
            const descValidation = ValidationUtils.validateDescription(data.description);
            if (!descValidation.valid) errors.push(descValidation.message);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
};

// Export to window for global access
window.ValidationUtils = ValidationUtils;
