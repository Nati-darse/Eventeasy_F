import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

// Validation rules
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  },
  confirmPassword: {
    required: true,
    validate: (value, values) => {
      if (value !== values.password) {
        return ['Passwords do not match'];
      }
      return [];
    }
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    message: 'Name must be between 2 and 50 characters and contain only letters and spaces'
  },
  eventName: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: 'Event name must be between 3 and 100 characters'
  },
  description: {
    maxLength: 1000,
    message: 'Description cannot exceed 1000 characters'
  }
};

// Validation function
export const validateField = (value, rules, allValues = {}) => {
  const errors = [];

  if (rules.required && (!value || value.trim() === '')) {
    errors.push('This field is required');
  }

  if (value && rules.minLength && value.length < rules.minLength) {
    errors.push(`Minimum length is ${rules.minLength} characters`);
  }

  if (value && rules.maxLength && value.length > rules.maxLength) {
    errors.push(`Maximum length is ${rules.maxLength} characters`);
  }

  if (value && rules.pattern && !rules.pattern.test(value)) {
    errors.push(rules.message || 'Invalid format');
  }

  // Handle custom validation
  if (value && rules.validate && typeof rules.validate === 'function') {
    const customErrors = rules.validate(value, allValues);
    if (Array.isArray(customErrors)) {
      errors.push(...customErrors);
    }
  }

  return errors;
};

// Form field component with validation
export const ValidatedInput = ({ 
  type = 'text', 
  name, 
  value, 
  onChange, 
  onBlur,
  placeholder, 
  rules, 
  errors = [],
  className = '',
  ...props 
}) => {
  const hasErrors = errors.length > 0;

  return (
    <div className="w-full">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-lg border ${
          hasErrors 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500'
        } focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${className}`}
        {...props}
      />
      {hasErrors && (
        <div className="mt-1 space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center text-red-500 text-sm">
              <FaExclamationCircle className="mr-1 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Textarea with validation
export const ValidatedTextarea = ({ 
  name, 
  value, 
  onChange, 
  onBlur,
  placeholder, 
  rules, 
  errors = [],
  rows = 3,
  className = '',
  ...props 
}) => {
  const hasErrors = errors.length > 0;

  return (
    <div className="w-full">
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 rounded-lg border ${
          hasErrors 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500'
        } focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white resize-vertical ${className}`}
        {...props}
      />
      {hasErrors && (
        <div className="mt-1 space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center text-red-500 text-sm">
              <FaExclamationCircle className="mr-1 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Custom hook for form validation
export const useFormValidation = (initialValues, validationSchema) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const validateField = (name, value) => {
    const rules = validationSchema[name];
    if (!rules) return [];

    const fieldErrors = [];

    if (rules.required && (!value || value.trim() === '')) {
      fieldErrors.push('This field is required');
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      fieldErrors.push(`Minimum length is ${rules.minLength} characters`);
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      fieldErrors.push(`Maximum length is ${rules.maxLength} characters`);
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
      fieldErrors.push(rules.message || 'Invalid format');
    }

    // Handle custom validation
    if (value && rules.validate && typeof rules.validate === 'function') {
      const customErrors = rules.validate(value, values);
      if (Array.isArray(customErrors)) {
        fieldErrors.push(...customErrors);
      }
    }

    return fieldErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));

    // Validate field if it has been touched
    if (touched[name]) {
      const fieldErrors = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: fieldErrors }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const fieldErrors = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldErrors }));
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(name => {
      const fieldErrors = validateField(name, values[name] || '');
      if (fieldErrors.length > 0) {
        newErrors[name] = fieldErrors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationSchema).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {}));

    return isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues,
  };
};