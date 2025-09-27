import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Contact, ContactFormData } from '../types';
import Input from './ui/Input';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { User, Mail, Phone, Building, MapPin, Tag, FileText } from 'lucide-react';

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContactFormData) => Promise<void>;
  contact?: Contact;
  title?: string;
}

const contactSchema = yup.object({
  firstName: yup.string().required('First name is required').max(50, 'First name too long'),
  lastName: yup.string().required('Last name is required').max(50, 'Last name too long'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  company: yup.string().optional().max(100, 'Company name too long'),
  jobTitle: yup.string().optional().max(100, 'Job title too long'),
  address: yup.object({
    street: yup.string().optional(),
    city: yup.string().optional(),
    state: yup.string().optional(),
    zipCode: yup.string().optional(),
    country: yup.string().optional(),
  }).optional(),
  tags: yup.array().of(yup.string()).optional(),
  notes: yup.string().optional().max(500, 'Notes too long'),
  isFavorite: yup.boolean().optional(),
});

const ContactForm: React.FC<ContactFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contact,
  title,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [tagsInput, setTagsInput] = React.useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: yupResolver(contactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      tags: [],
      notes: '',
      isFavorite: false,
    },
  });

  const tags = watch('tags') || [];

  React.useEffect(() => {
    if (contact) {
      reset({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        company: contact.company || '',
        jobTitle: contact.jobTitle || '',
        address: contact.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        tags: contact.tags,
        notes: contact.notes || '',
        isFavorite: contact.isFavorite,
      });
      setTagsInput(contact.tags.join(', '));
    } else {
      reset();
      setTagsInput('');
    }
  }, [contact, reset]);

  const handleFormSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagsInput(value);
    
    // Parse tags from comma-separated string
    const parsedTags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    setValue('tags', parsedTags);
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setValue('tags', newTags);
      setTagsInput(newTags.join(', '));
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setValue('tags', newTags);
    setTagsInput(newTags.join(', '));
  };

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || (contact ? 'Edit Contact' : 'Add New Contact')}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Personal Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              {...register('firstName')}
              error={errors.firstName?.message}
              icon={User}
              fullWidth
            />
            <Input
              label="Last Name *"
              {...register('lastName')}
              error={errors.lastName?.message}
              fullWidth
            />
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Contact Information
          </h4>
          <div className="space-y-4">
            <Input
              label="Email *"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              icon={Mail}
              fullWidth
            />
            <Input
              label="Phone *"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
              icon={Phone}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                e.target.value = formatted;
                register('phone').onChange(e);
              }}
              fullWidth
            />
          </div>
        </div>

        {/* Professional Information */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Building className="w-4 h-4 mr-2" />
            Professional Information
          </h4>
          <div className="space-y-4">
            <Input
              label="Company"
              {...register('company')}
              error={errors.company?.message}
              icon={Building}
              fullWidth
            />
            <Input
              label="Job Title"
              {...register('jobTitle')}
              error={errors.jobTitle?.message}
              fullWidth
            />
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Address Information
          </h4>
          <div className="space-y-4">
            <Input
              label="Street Address"
              {...register('address.street')}
              error={errors.address?.street?.message}
              fullWidth
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City"
                {...register('address.city')}
                error={errors.address?.city?.message}
                fullWidth
              />
              <Input
                label="State/Province"
                {...register('address.state')}
                error={errors.address?.state?.message}
                fullWidth
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="ZIP/Postal Code"
                {...register('address.zipCode')}
                error={errors.address?.zipCode?.message}
                fullWidth
              />
              <Input
                label="Country"
                {...register('address.country')}
                error={errors.address?.country?.message}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Tags
          </h4>
          <Input
            label="Tags (comma-separated)"
            value={tagsInput}
            onChange={handleTagsChange}
            placeholder="friend, colleague, client, etc."
            helperText="Enter tags separated by commas"
            icon={Tag}
            fullWidth
          />
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Notes
          </h4>
          <textarea
            {...register('notes')}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional notes about this contact..."
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        {/* Favorite Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('isFavorite')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Mark as favorite
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {contact ? 'Update Contact' : 'Add Contact'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ContactForm;