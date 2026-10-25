import { FieldConfig, FieldType } from '@shared';

export const loginFormFields: FieldConfig[] = [
  {
    
  key: 'username',
  label: 'LOGIN.USERNAME',

    type: FieldType.input,
    class: 'col-12',
    appearance: 'outline',
    required: true
  },
  {
    key: 'password',
    label: 'LOGIN.PASSWORD',
    type: FieldType.input,
    inputType: 'password',
    class: 'col-12',
    appearance: 'outline',
    required: true
  },
{
  key: 'submit',
  type: FieldType.button,
  label: 'Login',
  class: 'col-12',
  fieldClass: 'w-100 login-green-btn'
}
];
