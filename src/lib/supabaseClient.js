import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Check if credentials are valid and not placeholders
const hasValidCredentials = 
  supabaseUrl && 
  supabasePublishableKey && 
  supabaseUrl !== 'your-supabase-url' && 
  supabasePublishableKey !== 'your-supabase-anon-key' &&
  supabaseUrl.startsWith('http');

let client;

if (hasValidCredentials) {
  console.log('[AI Studio] Connecting to real Supabase database');
  client = createClient(supabaseUrl, supabasePublishableKey);
} else {
  console.warn('[AI Studio] Supabase environment variables not set or default placeholders. Using high-fidelity in-memory mock client with LocalStorage persistence.');

  // Seeding default LocalStorage data if missing
  const seedLocalStorage = () => {
    if (!localStorage.getItem('nexus_db_cleaned_v2')) {
      localStorage.removeItem('nexus_db_posts');
      localStorage.removeItem('nexus_db_friend_requests');
      localStorage.removeItem('nexus_db_conversations');
      localStorage.removeItem('nexus_db_conversation_members');
      localStorage.removeItem('nexus_db_messages');
      localStorage.removeItem('nexus_db_likes');
      localStorage.removeItem('nexus_db_comments');
      localStorage.removeItem('nexus_db_notifications');
      localStorage.setItem('nexus_db_cleaned_v2', 'true');
    }

    const defaultData = {
      profiles: [
        {
          id: 'me',
          username: 'nexus_pioneer',
          full_name: 'Nexus Explorer',
          profile_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
          cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          bio: 'Exploring the next generation of social interaction. Built on Nexus.',
          location: 'Metaverse',
          created_at: '2026-09-22T00:00:00Z',
        },
        {
          id: 'user_1',
          username: 'sarah_design',
          full_name: 'Sarah Connor',
          profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
          cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          bio: 'Product Designer & Pixel Perfect Enthusiast',
          location: 'San Francisco, CA',
          created_at: '2025-01-15T12:00:00Z',
        },
        {
          id: 'user_2',
          username: 'alex_dev',
          full_name: 'Alex Rivers',
          profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
          cover_image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
          bio: 'Fullstack Engineer. I turn coffee into clean code.',
          location: 'Austin, TX',
          created_at: '2025-02-10T09:30:00Z',
        },
        {
          id: 'user_3',
          username: 'elena_creates',
          full_name: 'Elena Rostova',
          profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
          cover_image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
          bio: 'Digital Artist & Illustrator. Dreaming in neon colors.',
          location: 'New York, NY',
          created_at: '2025-03-01T14:45:00Z',
        },
        {
          id: 'user_gemini_ai',
          username: 'gemini_ai',
          full_name: 'Gemini AI Assistant',
          profile_image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=150&h=150&q=80',
          cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          bio: 'Official Nexus AI Companion. Ask me anything, generate images or chat!',
          location: 'Google AI Studio',
          created_at: '2026-09-22T00:00:00Z',
        }
      ],
      posts: [],
      likes: [],
      comments: [],
      conversations: [],
      conversation_members: [],
      messages: [],
      friend_requests: [],
      notifications: []
    };

    Object.entries(defaultData).forEach(([key, val]) => {
      if (!localStorage.getItem(`nexus_db_${key}`)) {
        localStorage.setItem(`nexus_db_${key}`, JSON.stringify(val));
      }
    });

    if (!localStorage.getItem('nexus_auth_session')) {
      localStorage.setItem('nexus_auth_session', JSON.stringify({
        user: {
          id: 'me',
          email: 'explorer@nexus.com',
          user_metadata: {}
        }
      }));
    }
  };

  seedLocalStorage();

  const getLocalTable = (table) => {
    try {
      return JSON.parse(localStorage.getItem(`nexus_db_${table}`)) || [];
    } catch {
      return [];
    }
  };

  const setLocalTable = (table, data) => {
    localStorage.setItem(`nexus_db_${table}`, JSON.stringify(data));
  };

  const getAuthSession = () => {
    try {
      return JSON.parse(localStorage.getItem('nexus_auth_session')) || null;
    } catch {
      return null;
    }
  };

  const setAuthSession = (session) => {
    if (session) {
      localStorage.setItem('nexus_auth_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('nexus_auth_session');
    }
  };

  // Mock Query Builder mimicking Supabase chainable methods
  class MockQueryBuilder {
    constructor(table) {
      this.table = table;
      this.filters = [];
      this.orderBy = null;
      this.limitCount = null;
      this.isSingle = false;
      this.isMaybeSingle = false;
    }

    select(fields) {
      return this;
    }

    eq(column, value) {
      this.filters.push((row) => row[column] === value);
      return this;
    }

    neq(column, value) {
      this.filters.push((row) => row[column] !== value);
      return this;
    }

    in(column, values) {
      this.filters.push((row) => values.includes(row[column]));
      return this;
    }

    order(column, options = {}) {
      this.orderBy = { column, ascending: options.ascending ?? true };
      return this;
    }

    limit(count) {
      this.limitCount = count;
      return this;
    }

    single() {
      this.isSingle = true;
      return this;
    }

    maybeSingle() {
      this.isMaybeSingle = true;
      return this;
    }

    async then(onfulfilled) {
      try {
        const result = this.execute();
        return onfulfilled({ data: result, error: null });
      } catch (err) {
        return onfulfilled({ data: null, error: err });
      }
    }

    execute() {
      const list = getLocalTable(this.table);
      let filtered = list.filter((row) => this.filters.every((fn) => fn(row)));

      if (this.orderBy) {
        const { column, ascending } = this.orderBy;
        filtered.sort((a, b) => {
          const valA = a[column];
          const valB = b[column];
          if (valA < valB) return ascending ? -1 : 1;
          if (valA > valB) return ascending ? 1 : -1;
          return 0;
        });
      }

      if (this.limitCount !== null) {
        filtered = filtered.slice(0, this.limitCount);
      }

      if (this.isSingle || this.isMaybeSingle) {
        return filtered[0] || null;
      }

      return filtered;
    }

    async insert(data) {
      const list = getLocalTable(this.table);
      const dataArray = Array.isArray(data) ? data : [data];
      const inserted = dataArray.map((item) => {
        const newItem = {
          id: item.id || `${this.table.slice(0, -1)}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          created_at: new Date().toISOString(),
          ...item,
        };
        list.push(newItem);
        return newItem;
      });
      setLocalTable(this.table, list);
      
      const responseData = Array.isArray(data) ? inserted : inserted[0];
      
      // Return custom result that behaves like Promise and supports chaining .select().single()
      const resultObj = {
        data: responseData,
        error: null,
        select: () => ({
          single: () => Promise.resolve({ data: responseData, error: null })
        })
      };

      // Make it thenable directly
      resultObj.then = (onfulfilled) => onfulfilled(resultObj);
      return resultObj;
    }

    async update(data) {
      const list = getLocalTable(this.table);
      const updatedRows = [];
      const updatedList = list.map((row) => {
        const matches = this.filters.every((fn) => fn(row));
        if (matches) {
          const updatedRow = { ...row, ...data };
          updatedRows.push(updatedRow);
          return updatedRow;
        }
        return row;
      });
      setLocalTable(this.table, updatedList);
      
      const responseData = this.isSingle || this.isMaybeSingle ? (updatedRows[0] || null) : updatedRows;
      const resultObj = {
        data: responseData,
        error: null,
      };
      resultObj.then = (onfulfilled) => onfulfilled(resultObj);
      return resultObj;
    }

    async delete() {
      const list = getLocalTable(this.table);
      const remaining = list.filter((row) => !this.filters.every((fn) => fn(row)));
      setLocalTable(this.table, remaining);
      
      const resultObj = { data: [], error: null };
      resultObj.then = (onfulfilled) => onfulfilled(resultObj);
      return resultObj;
    }
  }

  // Auth Listeners
  const authListeners = new Set();

  client = {
    auth: {
      async getSession() {
        const session = getAuthSession();
        return { data: { session }, error: null };
      },
      async getUser() {
        const session = getAuthSession();
        return { data: { user: session?.user || null }, error: null };
      },
      onAuthStateChange(callback) {
        authListeners.add(callback);
        const session = getAuthSession();
        // Call immediately with current state
        setTimeout(() => {
          callback('SIGNED_IN', session);
        }, 0);

        return {
          data: {
            subscription: {
              unsubscribe() {
                authListeners.delete(callback);
              }
            }
          }
        };
      },
      async signUp({ email, password, options }) {
        const id = `user_${Date.now()}`;
        const user = {
          id,
          email,
          user_metadata: options?.data || {}
        };
        const session = { user, expires_at: Date.now() + 3600000 };
        setAuthSession(session);

        // Add user profile to local table
        const profiles = getLocalTable('profiles');
        profiles.push({
          id,
          username: email.split('@')[0],
          full_name: options?.data?.full_name || email.split('@')[0],
          profile_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
          cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          bio: 'Exploring the next generation of social interaction. Built on Nexus.',
          location: '',
          created_at: new Date().toISOString()
        });
        setLocalTable('profiles', profiles);

        authListeners.forEach((cb) => cb('SIGNED_IN', session));
        return { data: { user, session }, error: null };
      },
      async signInWithPassword({ email, password }) {
        const profiles = getLocalTable('profiles');
        // Look for existing profile matching email split, or default to a mock profile
        const profile = profiles.find(p => p.username === email.split('@')[0] || p.id === 'me');
        const id = profile?.id || 'me';
        
        const user = {
          id,
          email,
          user_metadata: {}
        };
        const session = { user, expires_at: Date.now() + 3600000 };
        setAuthSession(session);

        authListeners.forEach((cb) => cb('SIGNED_IN', session));
        return { data: { user, session }, error: null };
      },
      async signOut() {
        setAuthSession(null);
        authListeners.forEach((cb) => cb('SIGNED_OUT', null));
        return { error: null };
      }
    },
    storage: {
      from(bucketName) {
        return {
          async upload(filePath, file, options) {
            console.log(`[Mock Storage] Uploading file to bucket: ${bucketName}, path: ${filePath}`);
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (event) => {
                const dataUrl = event.target?.result;
                const mockFiles = JSON.parse(localStorage.getItem('nexus_mock_storage') || '{}');
                mockFiles[filePath] = dataUrl;
                localStorage.setItem('nexus_mock_storage', JSON.stringify(mockFiles));
                resolve({ data: { path: filePath }, error: null });
              };
              reader.onerror = (err) => {
                resolve({ data: null, error: err });
              };
              reader.readAsDataURL(file);
            });
          },
          getPublicUrl(filePath) {
            const mockFiles = JSON.parse(localStorage.getItem('nexus_mock_storage') || '{}');
            const dataUrl = mockFiles[filePath] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
            return { data: { publicUrl: dataUrl } };
          }
        };
      }
    },
    from(tableName) {
      return new MockQueryBuilder(tableName);
    },
    channel(name) {
      const ch = {
        on(event, filter, callback) {
          return ch;
        },
        subscribe() {
          return {
            unsubscribe() {
              // noop
            }
          };
        }
      };
      return ch;
    },
    removeChannel() {
      // noop
    }
  };
}

export const supabase = client;
