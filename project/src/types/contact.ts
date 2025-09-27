export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  tags: string[];
  notes?: string;
  avatar?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastContacted?: Date;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  tags: string[];
  notes?: string;
  isFavorite?: boolean;
}

export interface SearchResult {
  contact: Contact;
  score: number;
  matchedFields: string[];
}

export interface ContactStats {
  total: number;
  favorites: number;
  recentlyAdded: number;
  tagsCount: Record<string, number>;
  companiesCount: Record<string, number>;
}