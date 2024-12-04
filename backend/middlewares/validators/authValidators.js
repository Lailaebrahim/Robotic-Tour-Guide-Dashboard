import expressValidator from 'express-validator';

export const signUpValidator  = expressValidator.checkSchema({
    email: {
        isString: true,
        isEmail: true,
        in: ['body', 'formData'],
        errorMessage: 'Please provide a valid email address'
    },
    password: {
        isString: true,
        in: ['body', 'formData'],
        isLength: {
            options: { min: 6 , max: 16},
            errorMessage: 'Password should be at least 6 chars and at most 16 chars long',
          },
    },
    username: {
        isString: true,
        in: ['body', 'formData'],
        isLength: {
            options: { min: 8 , max: 16},
            errorMessage: 'Username should be at least 8 chars and at most 16 chars long',
          }
    },
    confirmPassword: {
        isString: true,
        in: ['body', 'formData'],
        custom: {
            options: (value, { req }) => value === req.body.password,
            errorMessage: 'Passwords do not match'
        }
    },
});

export const loginValidator = expressValidator.checkSchema({
    email: {
        isString: true,
        isEmail: true,
        in: ['body', 'formData'],
        errorMessage: 'Email Required'
    },
    password: {
        isString: true,
        in: ['body', 'formData'],
        errorMessage: 'Password Required'
    },
});

export const completeAccountValidator = expressValidator.checkSchema({
    firstName: {
        isString: true,
        in: ['formData'],
        errorMessage: 'First Name Required'
    },
    lastName: {
        isString: true,
        in: ['formData'],
        errorMessage: 'Last Name Required'
    },
    password: {
        isString: true,
        in: ['formData'],
        errorMessage: 'Password Required'
    }
});