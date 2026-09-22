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
        }
      ],
      posts: [
        {
          id: 'post_1',
          user_id: 'user_1',
          content: 'Just finished designing the new dark mode system for the design team. What do you think about these high-contrast accents?',
          image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
          created_at: '2026-09-22T08:00:00Z',
        },
        {
          id: 'post_2',
          user_id: 'user_2',
          content: 'Exploring some React 19 features today. Server Actions are incredibly powerful! Re-architecting our form-handling state is so much simpler now.',
          image_url: null,
          created_at: '2026-09-21T18:30:00Z',
        },
        {
          id: 'post_3',
          user_id: 'user_3',
          content: "Here is my latest digital paint piece 'Lost in the Neon Sea'. Swipe to see the details of the brush strokes!",
          image_url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1000&q=80',
          created_at: '2026-09-22T10:15:00Z',
        }
      ],
      likes: [
        { id: 'like_1', post_id: 'post_1', user_id: 'user_2' },
        { id: 'like_2', post_id: 'post_3', user_id: 'user_1' }
      ],
      comments: [
        { id: 'comment_1', post_id: 'post_1', user_id: 'user_2', content: 'This looks gorgeous! The neon purple pops perfectly against the dark background.', created_at: '2026-09-22T08:30:00Z' },
        { id: 'comment_2', post_id: 'post_1', user_id: 'user_3', content: 'Stunning colors! Love the subtle glow effects.', created_at: '2026-09-22T09:00:00Z' },
        { id: 'comment_3', post_id: 'post_2', user_id: 'user_1', content: 'Absolutely agree, form handling has always been a pain and this makes it a breeze.', created_at: '2026-09-21T19:00:00Z' }
      ],
      conversations: [
        { id: 'conv_1', created_at: '2026-09-20T10:00:00Z' },
        { id: 'conv_2', created_at: '2026-09-20T11:00:00Z' }
      ],
      conversation_members: [
        { conversation_id: 'conv_1', user_id: 'me' },
        { conversation_id: 'conv_1', user_id: 'user_1' },
        { conversation_id: 'conv_2', user_id: 'me' },
        { conversation_id: 'conv_2', user_id: 'user_2' }
      ],
      messages: [
        { id: 'msg_1', conversation_id: 'conv_1', sender_id: 'user_1', content: 'Hey! Loved your latest post. Are you free to check some wireframes today?', created_at: '2026-09-22T12:00:00Z' },
        { id: 'msg_2', conversation_id: 'conv_2', sender_id: 'user_2', content: 'Hey mate, did you see the new update for Vite? It compiles incredibly fast.', created_at: '2026-09-22T11:30:00Z' }
      ],
      friend_requests: [
        { id: 'req_1', sender_id: 'user_3', receiver_id: 'me', status: 'pending', created_at: '2026-09-22T11:00:00Z' }
      ],
      notifications: [
        { id: 'notif_1', user_id: 'me', type: 'friend_request', reference_id: 'req_1', is_read: false, created_at: '2026-09-22T11:00:00Z' },
        { id: 'notif_2', user_id: 'me', type: 'message', reference_id: 'msg_1', is_read: false, created_at: '2026-09-22T12:00:00Z' }
      ]
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
