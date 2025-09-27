import Dexie from 'dexie';
import { Contact, ContactFormData } from '../types';

class ContactDatabase extends Dexie {
  contacts!: Dexie.Table<Contact, string>;

  constructor() {
    super('ContactManager');
    
    this.version(1).stores({
      contacts: 'id, firstName, lastName, email, phone, company, createdAt, updatedAt, isFavorite, tags'
    });
  }
}

class ContactStorage {
  private db: ContactDatabase;

  constructor() {
    this.db = new ContactDatabase();
  }

  async createContact(contactData: ContactFormData): Promise<Contact> {
    const now = new Date();
    const contact: Contact = {
      id: this.generateId(),
      ...contactData,
      tags: contactData.tags || [],
      isFavorite: contactData.isFavorite || false,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.contacts.add(contact);
    return contact;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact | null> {
    const existing = await this.db.contacts.get(id);
    if (!existing) return null;

    const updated: Contact = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    await this.db.contacts.put(updated);
    return updated;
  }

  async deleteContact(id: string): Promise<boolean> {
    const deleted = await this.db.contacts.delete(id);
    return deleted === 1;
  }

  async getContact(id: string): Promise<Contact | null> {
    const contact = await this.db.contacts.get(id);
    return contact || null;
  }

  async getAllContacts(): Promise<Contact[]> {
    return await this.db.contacts.toArray();
  }

  async getContactsByTag(tag: string): Promise<Contact[]> {
    return await this.db.contacts
      .filter(contact => contact.tags.includes(tag))
      .toArray();
  }

  async getFavoriteContacts(): Promise<Contact[]> {
    return await this.db.contacts
      .where('isFavorite')
      .equals(1)
      .toArray();
  }

  async getContactsByCompany(company: string): Promise<Contact[]> {
    return await this.db.contacts
      .where('company')
      .equals(company)
      .toArray();
  }

  async getRecentContacts(days: number = 7): Promise<Contact[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await this.db.contacts
      .where('createdAt')
      .above(cutoffDate)
      .toArray();
  }

  async clearAllContacts(): Promise<void> {
    await this.db.contacts.clear();
  }

  async bulkCreateContacts(contacts: ContactFormData[]): Promise<Contact[]> {
    const now = new Date();
    const contactsToAdd: Contact[] = contacts.map(contactData => ({
      id: this.generateId(),
      ...contactData,
      tags: contactData.tags || [],
      isFavorite: contactData.isFavorite || false,
      createdAt: now,
      updatedAt: now,
    }));

    await this.db.contacts.bulkAdd(contactsToAdd);
    return contactsToAdd;
  }

  async bulkUpdateContacts(updates: { id: string; data: Partial<Contact> }[]): Promise<void> {
    const now = new Date();
    
    await Promise.all(
      updates.map(async ({ id, data }) => {
        const existing = await this.db.contacts.get(id);
        if (existing) {
          await this.db.contacts.put({
            ...existing,
            ...data,
            updatedAt: now,
          });
        }
      })
    );
  }

  async bulkDeleteContacts(ids: string[]): Promise<number> {
    await this.db.contacts.bulkDelete(ids);
    return ids.length;
  }

  async exportToJSON(): Promise<string> {
    const contacts = await this.getAllContacts();
    return JSON.stringify(contacts, null, 2);
  }

  async importFromJSON(jsonData: string): Promise<Contact[]> {
    try {
      const contactsData: ContactFormData[] = JSON.parse(jsonData);
      return await this.bulkCreateContacts(contactsData);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  async getStorageStats(): Promise<{
    totalContacts: number;
    storageUsed: number;
    lastBackup?: Date;
  }> {
    const contacts = await this.getAllContacts();
    const storageUsed = new Blob([JSON.stringify(contacts)]).size;
    
    return {
      totalContacts: contacts.length,
      storageUsed,
      lastBackup: undefined, // TODO: Implement backup tracking
    };
  }

  private generateId(): string {
    return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Backup and restore methods
  async createBackup(): Promise<Blob> {
    const contacts = await this.getAllContacts();
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      contacts,
    };
    
    return new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
  }

  async restoreFromBackup(backupData: string): Promise<void> {
    try {
      const backup = JSON.parse(backupData);
      
      if (!backup.contacts || !Array.isArray(backup.contacts)) {
        throw new Error('Invalid backup format');
      }

      // Clear existing data
      await this.clearAllContacts();
      
      // Restore contacts
      await this.db.contacts.bulkAdd(backup.contacts);
    } catch (error) {
      throw new Error('Failed to restore from backup: ' + (error as Error).message);
    }
  }
}

export const contactStorage = new ContactStorage();