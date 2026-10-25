import { FieldConfig, FieldType } from '@shared';

export const registerFormFields: FieldConfig[] = [
  {
     key: 'fullname',
    label: 'REGISTER.FULLNAME',
    type: FieldType.input,
    class: 'col-12',
    appearance: 'outline',
    required: true
  },
  {
    key: 'username',
  label: 'REGISTER.USERNAME',
    type: FieldType.input,
    class: 'col-md-6 col-12',
    appearance: 'outline',
    required: true
  },
  {
    key: 'Region',
    label: 'REGISTER.REGION',
    type: FieldType.input,
    inputType: 'email',
    class: 'col-md-6 col-12',
    appearance: 'outline',
    required: true
  },
   {
    key: 'District',
    label: 'REGISTER.DISTRICT',
    type: FieldType.input,
    inputType: 'email',
    class: 'col-md-6 col-12',
    appearance: 'outline',
    required: true
  },
   {
    key: 'ward',
    label: 'REGISTER.WARD',
    type: FieldType.input,
    inputType: 'email',
    class: 'col-md-6 col-12',
    appearance: 'outline',
    required: true
  },
    {
    key: 'Village',
    label: 'REGISTER.VILLAGE',
    type: FieldType.input,
    inputType: 'email',
    class: 'col-md-6 col-12',
    appearance: 'outline',
    required: true
  },
  {
    key: 'phoneNumber',
    label: 'REGISTER.PHONE',

    type: FieldType.input,
    class: 'col-md-6 col-12',
    appearance: 'outline',
    required: true
  },
  // {
  //   key: 'userType',
  //   label: 'User Type',
  //   label: 'LOGIN.USERNAME',
  //   type: FieldType.select,
  //   class: 'col-md-6 col-12',
  //   appearance: 'outline',
  //   required: true,
  //   options: [
  //     { name: 'Farmer', value: 'FARMER' },
  //     { name: 'Extension Officer', value: 'EXTENSION_OFFICER' },
  //     { name: 'Production Officer', value: 'PRODUCTION_OFFICER' },
  //     { name: 'Researcher', value: 'RESEARCHER' }
  //   ]
  // },
  {
    key: 'password',
    label: 'REGISTER.PASSWORD',

    type: FieldType.input,
    inputType: 'password',
    class: 'col-md-6 col-12',
    appearance: 'outline',
    required: true
  },
  {
    key: 'confirmPassword',
    label: 'REGISTER.CONFIRM_PASSWORD',

    type: FieldType.input,
    inputType: 'password',
    class: 'col-md-6 col-12',
    appearance: 'outline',
    required: true
  },
  {
    key: 'submit',
    label: 'Create Account',
    type: FieldType.button,
    class: 'col-12',
      fieldClass: 'w-100 login-green-btn'

  }
];
