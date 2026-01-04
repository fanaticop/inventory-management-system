import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { generateResetToken, validateResetToken, removeResetToken } from '../utils/resetToken'
import { signInWithPassword as supaSignInWithPassword } from '../services/authService'

export interface Asset {
  id: string;
  name: string;
  type: 'desktop' | 'laptop' | 'printer' | 'other';
  serialNumber: string;
  model: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  assignedTo?: string;
  purchaseDate: string;
  warrantyExpiry: string;
  location: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  location: string;
  supplier: string;
  lastRestocked: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  department: string;
  password: string;
  provider?: 'email' | 'google' | 'github' | 'facebook' | 'twitter' | 'instagram';
  providerId?: string;
}

interface StoreState {
  isAuthenticated: boolean;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  assets: Asset[];
  stockItems: StockItem[];
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<User, 'id'>) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  completePasswordReset: (token: string, email: string, newPassword: string) => Promise<void>;
  socialLogin: (provider: string, userData: any) => Promise<void>;
  fetchAssets: () => Promise<void>;
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  fetchStockItems: () => Promise<void>;
  updateStockQuantity: (id: string, quantity: number) => Promise<void>;
  addStockItem: (item: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateStockItem: (id: string, updates: Partial<StockItem>) => Promise<void>;
  deleteStockItem: (id: string) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  isAuthenticated: false,
  currentUser: null,
  loading: false,
  error: null,
  assets: [],
  stockItems: [],

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      // Try Supabase-backed login first. If Supabase isn't configured or the
      // sign-in fails, fall back to the local demo user store.
      try {
        const sessionData = await supaSignInWithPassword(email, password);

        // sessionData may contain { user, session } depending on Supabase version
        const supaUser: any = sessionData?.user || sessionData?.session?.user || null;
        if (supaUser && supaUser.email) {
          // Map Supabase user to the demo User shape (minimal fields)
          const currentUser: User = {
            id: supaUser.id || uuidv4(),
            name: (supaUser.user_metadata && supaUser.user_metadata.full_name) || supaUser.email.split('@')[0],
            email: supaUser.email,
            role: 'staff',
            department: 'General',
            password: ''
          };

          set({ currentUser, isAuthenticated: true, loading: false });
          return;
        }
      } catch (err) {
        // If Supabase sign-in fails (including 'Supabase not configured'),
        // we'll fall back to the demo localStorage-based auth below.
        // Keep going to local demo.
      }

      // Local demo fallback (keeps original behavior when Supabase isn't used)
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User) => u.email === email && u.password === password);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      set({ currentUser: user, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ error: 'Login failed', loading: false });
      throw err;
    }
  },

  signup: async (userData: Omit<User, 'id'>) => {
    set({ loading: true, error: null });
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const newUser: User = {
        ...userData,
        id: uuidv4()
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Add sample data for first user
      if (users.length === 1) {
        // Sample assets
        const sampleAssets: Asset[] = [
          {
            id: uuidv4(),
            name: 'Dell XPS 13',
            type: 'laptop',
            serialNumber: 'DL123456',
            model: 'XPS 13 9310',
            status: 'available',
            purchaseDate: '2025-01-15',
            warrantyExpiry: '2028-01-15',
            location: 'Office 101',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: uuidv4(),
            name: 'HP LaserJet Pro',
            type: 'printer',
            serialNumber: 'HP789012',
            model: 'M404n',
            status: 'assigned',
            assignedTo: 'IT Department',
            purchaseDate: '2024-11-20',
            warrantyExpiry: '2026-11-20',
            location: 'Office 102',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        // Sample stock items
        const sampleStockItems: StockItem[] = [
          {
            id: uuidv4(),
            name: 'A4 Paper',
            category: 'Office Supplies',
            quantity: 500,
            minQuantity: 100,
            unit: 'sheets',
            location: 'Storage Room A',
            supplier: 'Office Depot',
            lastRestocked: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: uuidv4(),
            name: 'Ink Cartridges',
            category: 'Printer Supplies',
            quantity: 15,
            minQuantity: 5,
            unit: 'pieces',
            location: 'Storage Room B',
            supplier: 'HP Store',
            lastRestocked: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        localStorage.setItem('assets', JSON.stringify(sampleAssets));
        localStorage.setItem('stockItems', JSON.stringify(sampleStockItems));
      }
      
      set({ currentUser: newUser, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ error: 'Signup failed', loading: false });
      throw err;
    }
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
  },

  resetPassword: async (email: string) => {
    set({ loading: true, error: null });
    try {
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User) => u.email === email);
      
      if (!user) {
        throw new Error('No account found with this email');
      }

      // Generate reset token
      const resetToken = generateResetToken(email);
      
      // Create reset link that points to the published site using a hash route (works reliably on GitHub Pages)
      const resetBase = 'https://fanaticop.github.io/inventory-management-system/#/reset-password';
      const resetLink = `${resetBase}?token=${resetToken.token}&email=${encodeURIComponent(email)}`;
      
      // Send the reset email using the email service
      const { sendPasswordResetEmail } = await import('../utils/emailService');
      await sendPasswordResetEmail(email, resetLink);

      set({ loading: false });

      // Return a success message instead of using alert so UI can show it inline
      return 'A password reset link has been sent to your email address.';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset link';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  completePasswordReset: async (token: string, email: string, newPassword: string) => {
    set({ loading: true, error: null });
    try {
      if (!validateResetToken(token, email)) {
        throw new Error('Invalid or expired reset token');
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.email === email);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Update the user's password
      users[userIndex].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));

      // Remove the used token
      removeResetToken(token);
      
      set({ loading: false });
    } catch (err) {
      set({ error: 'Password reset failed', loading: false });
      throw err;
    }
  },

  socialLogin: async (provider: string, userData: any) => {
    set({ loading: true, error: null });
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      let user = users.find((u: User) => 
        u.provider === provider && u.providerId === userData.id
      );
      
      if (!user) {
        user = {
          id: uuidv4(),
          name: userData.name,
          email: userData.email,
          role: 'staff',
          department: 'General',
          password: uuidv4(), // Generate a random password for social logins
          provider,
          providerId: userData.id
        };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
      }
      
      set({ currentUser: user, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ error: 'Social login failed', loading: false });
      throw err;
    }
  },

  fetchAssets: async () => {
    set({ loading: true, error: null });
    try {
      // For demo, we'll use localStorage. In a real app, this would be an API call
      let assets = JSON.parse(localStorage.getItem('assets') || '[]');
      
      // Initialize with sample data if no assets exist
      if (assets.length === 0) {
        assets = [
          {
            id: uuidv4(),
            name: 'Dell XPS 15',
            type: 'laptop',
            serialNumber: 'DLL-XPS-2023-001',
            model: 'XPS 15 9520',
            status: 'assigned',
            assignedTo: 'John Doe',
            purchaseDate: '2023-01-15',
            warrantyExpiry: '2026-01-15',
            location: 'Main Office',
            notes: 'Developer workstation',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: uuidv4(),
            name: 'HP LaserJet Pro',
            type: 'printer',
            serialNumber: 'HP-LJP-2023-001',
            model: 'M404dn',
            status: 'available',
            purchaseDate: '2023-02-01',
            warrantyExpiry: '2025-02-01',
            location: 'Print Room',
            notes: 'Shared network printer',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('assets', JSON.stringify(assets));
      }
      
      set({ assets, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch assets', loading: false });
      throw err;
    }
  },

  fetchStockItems: async () => {
    set({ loading: true, error: null });
    try {
      // For demo, we'll use localStorage. In a real app, this would be an API call
      const stockItems = JSON.parse(localStorage.getItem('stockItems') || '[]');
      set({ stockItems, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch stock items', loading: false });
      throw err;
    }
  },

  // Remove duplicate method

  updateStockQuantity: async (id: string, quantity: number) => {
    set({ loading: true, error: null });
    try {
      const { stockItems } = get();
      const updatedStockItems = stockItems.map(item => 
        item.id === id ? { ...item, quantity, updatedAt: new Date().toISOString() } : item
      );
      localStorage.setItem('stockItems', JSON.stringify(updatedStockItems));
      set({ stockItems: updatedStockItems, loading: false });
    } catch (err) {
      set({ error: 'Failed to update stock quantity', loading: false });
      throw err;
    }
  },

  addAsset: async (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ loading: true, error: null });
    try {
      const { assets } = get();
      const newAsset: Asset = {
        ...asset,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedAssets = [...assets, newAsset];
      localStorage.setItem('assets', JSON.stringify(updatedAssets));
      set({ assets: updatedAssets, loading: false });
    } catch (err) {
      set({ error: 'Failed to add asset', loading: false });
      throw err;
    }
  },

  updateAsset: async (id: string, updates: Partial<Asset>) => {
    set({ loading: true, error: null });
    try {
      const { assets } = get();
      const updatedAssets = assets.map(asset =>
        asset.id === id
          ? { ...asset, ...updates, updatedAt: new Date().toISOString() }
          : asset
      );
      localStorage.setItem('assets', JSON.stringify(updatedAssets));
      set({ assets: updatedAssets, loading: false });
    } catch (err) {
      set({ error: 'Failed to update asset', loading: false });
      throw err;
    }
  },

  deleteAsset: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { assets } = get();
      const updatedAssets = assets.filter(asset => asset.id !== id);
      localStorage.setItem('assets', JSON.stringify(updatedAssets));
      set({ assets: updatedAssets, loading: false });
    } catch (err) {
      set({ error: 'Failed to delete asset', loading: false });
      throw err;
    }
  },

  addStockItem: async (item: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ loading: true, error: null });
    try {
      const { stockItems } = get();
      const newItem: StockItem = {
        ...item,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedItems = [...stockItems, newItem];
      localStorage.setItem('stockItems', JSON.stringify(updatedItems));
      set({ stockItems: updatedItems, loading: false });
    } catch (err) {
      set({ error: 'Failed to add stock item', loading: false });
      throw err;
    }
  },

  updateStockItem: async (id: string, updates: Partial<StockItem>) => {
    set({ loading: true, error: null });
    try {
      const { stockItems } = get();
      const updatedItems = stockItems.map(item =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      );
      localStorage.setItem('stockItems', JSON.stringify(updatedItems));
      set({ stockItems: updatedItems, loading: false });
    } catch (err) {
      set({ error: 'Failed to update stock item', loading: false });
      throw err;
    }
  },

  deleteStockItem: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { stockItems } = get();
      const updatedItems = stockItems.filter(item => item.id !== id);
      localStorage.setItem('stockItems', JSON.stringify(updatedItems));
      set({ stockItems: updatedItems, loading: false });
    } catch (err) {
      set({ error: 'Failed to delete stock item', loading: false });
      throw err;
    }
  }
}));