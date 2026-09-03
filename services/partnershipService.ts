
import { supabase } from './supabase';
import { Partnership, AchieveCategory, PartnershipStatus, PHEIType, AgreementType, ForeignPartnerType, Comment } from '../types';
import { MOCK_PARTNERSHIPS } from './mockData';

export interface FilterOptions {
  page: number;
  pageSize: number;
  searchQuery?: string;
  selectedAchieve?: AchieveCategory[];
  pheiType?: PHEIType;
  region?: string;
  continent?: string;
  country?: string;
  agreementType?: AgreementType;
  yearSigned?: number;
  status?: PartnershipStatus;
  foreignPartnerType?: ForeignPartnerType;
  field?: string;
  pheiName?: string;
  fheiName?: string;
}

export interface DashboardStats {
  verifiedCount: number;
  activeRegionsCount: number;
  partnerPheiCount: number;
  pendingAlertsCount: number;
}

export const partnershipService = {
  mapRow(p: any): Partnership {
    if (!p) return {} as Partnership;
    return {
      id: String(p.id),
      pheiName: p['NAME OF PHEI'] || 'Unknown Institution',
      pheiType: p['Type'] as PHEIType,
      region: p['Region'],
      country: p['COUNTRY'] || 'Unknown Country',
      foreignInstitution: p['NAME OF FOREIGN INSTITUTION /ORGANIZATION'] || 'Unknown Foreign Institution',
      foreignPartnerType: p['Type of Foreign Partner'] as ForeignPartnerType,
      field: p['Field'] || 'General Cooperation',
      yearSigned: p['YEAR SIGNED'] || new Date().getFullYear(),
      dateSigned: p['DATE SIGNED'],
      typeOfAgreement: p['Type of Agreement'] as AgreementType,
      status: (p['verification_status'] as PartnershipStatus) || 'Pending',
      continent: p['Continent'] || 'Asia',
      achieveCategories: p.achieve_categories || [],
      remarks: p['REMARKS'],
      agreement_document_url: p.agreement_path, 
      cmo1_document_url: p.cmo1_path,           
      document_url: p.agreement_path,          
      sdgs: p.sdgs || [],
      registered_by: p.registered_by,
      createdAt: p.created_at
    };
  },

  async getPendingCount(): Promise<number> {
    try {
      const { count } = await supabase
        .from('linkages')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'Pending');
      return count || 0;
    } catch (e) {
      return MOCK_PARTNERSHIPS.filter(p => p.status === 'Pending').length;
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // 1. Verified Linkages
      const { count: verifiedCount } = await supabase
        .from('linkages')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'Approved');

      // 2. Pending Review Alerts
      const pendingCount = await this.getPendingCount();

      // 3. Unique Regions and Partner PHEIs
      const { data: regionsData } = await supabase
        .from('linkages')
        .select('"Region"');
      
      const { data: pheiData } = await supabase
        .from('linkages')
        .select('"NAME OF PHEI"');

      const uniqueRegions = new Set(regionsData?.map(r => r.Region).filter(Boolean));
      const uniquePheis = new Set(pheiData?.map(p => p["NAME OF PHEI"]).filter(Boolean));

      return {
        verifiedCount: verifiedCount || 0,
        pendingAlertsCount: pendingCount,
        activeRegionsCount: uniqueRegions.size,
        partnerPheiCount: uniquePheis.size
      };
    } catch (e) {
      console.error("Stats aggregation failed:", e);
      return {
        verifiedCount: MOCK_PARTNERSHIPS.filter(p => p.status === 'Approved').length,
        activeRegionsCount: 17,
        partnerPheiCount: 284,
        pendingAlertsCount: MOCK_PARTNERSHIPS.filter(p => p.status === 'Pending').length
      };
    }
  },

  async deleteLinkage(id: string): Promise<{ error: any }> {
    try {
      if (id.startsWith('p-')) {
        console.warn("Simulation Mode: Mock record deletion skipped.");
        return { error: null };
      }

      const { error } = await supabase
        .from('linkages')
        .delete()
        .eq('id', id);
        
      return { error };
    } catch (e) {
      return { error: e };
    }
  },

  async toggleFavorite(partnershipId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: existing } = await supabase
        .from('benchmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('linkage_id', partnershipId)
        .single();

      if (existing) {
        await supabase.from('benchmarks').delete().eq('id', existing.id);
        return false;
      } else {
        await supabase.from('benchmarks').insert({ user_id: user.id, linkage_id: partnershipId });
        return true;
      }
    } catch (e) {
      return true;
    }
  },

  async getUserBenchmarkIds(): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from('benchmarks').select('linkage_id').eq('user_id', user.id);
      return (data || []).map(f => String(f.linkage_id));
    } catch (e) {
      return [];
    }
  },

  async getUserFavorites(): Promise<Partnership[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('benchmarks')
        .select(`
          linkage_id,
          linkages (
            id,
            created_at,
            "NAME OF PHEI",
            "Type",
            "Region",
            "COUNTRY",
            "Continent",
            "NAME OF FOREIGN INSTITUTION /ORGANIZATION",
            "Type of Foreign Partner",
            "Field",
            "YEAR SIGNED",
            "DATE SIGNED",
            "Type of Agreement",
            "verification_status",
            "REMARKS",
            "agreement_path",
            "cmo1_path",
            "sdgs",
            "achieve_categories",
            "registered_by"
          )
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return (data || []).filter((item: any) => item.linkages).map((item: any) => this.mapRow(item.linkages));
    } catch (e) {
      return MOCK_PARTNERSHIPS.slice(0, 5);
    }
  },

  async getUserSubmissions(): Promise<Partnership[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from('linkages').select('*').eq('registered_by', user.id).order('id', { ascending: false });
      return (data || []).map(this.mapRow);
    } catch (e) {
      return MOCK_PARTNERSHIPS.filter(p => p.status === 'Pending').slice(0, 3);
    }
  },

  async getFiltered(options: FilterOptions): Promise<{ data: Partnership[], count: number }> {
    const { page, pageSize, searchQuery, ...filters } = options;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    try {
      let query = supabase.from('linkages').select('*', { count: 'exact' });

      if (searchQuery) {
        const fuzzy = `%${searchQuery.trim().split(/\s+/).join('%')}%`;
        query = query.or(`"NAME OF PHEI".ilike.${fuzzy},"COUNTRY".ilike.${fuzzy},"NAME OF FOREIGN INSTITUTION /ORGANIZATION".ilike.${fuzzy},"Field".ilike.${fuzzy}`);
      }

      if (filters.status) query = query.eq('verification_status', filters.status);
      if (filters.country) query = query.eq('COUNTRY', filters.country);
      if (filters.region) query = query.eq('Region', filters.region);
      if (filters.pheiType) query = query.eq('Type', filters.pheiType);
      if (filters.agreementType) query = query.eq('Type of Agreement', filters.agreementType);
      if (filters.field) query = query.ilike('Field', `%${filters.field}%`);
      if (filters.selectedAchieve && filters.selectedAchieve.length > 0) {
        query = query.contains('achieve_categories', filters.selectedAchieve);
      }

      const { data, count, error } = await query.order('id', { ascending: false }).range(from, to);
      if (error) throw error;
      return { data: (data || []).map(this.mapRow), count: count || 0 };
    } catch (e) {
      let filteredMock = [...MOCK_PARTNERSHIPS];
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filteredMock = filteredMock.filter(p => 
          p.foreignInstitution.toLowerCase().includes(q) || 
          p.country.toLowerCase().includes(q) || 
          p.field.toLowerCase().includes(q)
        );
      }
      
      if (filters.field) {
        const f = filters.field.toLowerCase();
        filteredMock = filteredMock.filter(p => p.field.toLowerCase().includes(f));
      }

      if (filters.selectedAchieve && filters.selectedAchieve.length > 0) {
        filteredMock = filteredMock.filter(p => 
          filters.selectedAchieve?.some(cat => p.achieveCategories?.includes(cat))
        );
      }
      
      return { data: filteredMock.slice(from, from + pageSize), count: filteredMock.length };
    }
  },

  async exportToCSV(options: Omit<FilterOptions, 'page' | 'pageSize'>): Promise<void> {
    try {
      let query = supabase.from('linkages').select('*');

      if (options.searchQuery) {
        const fuzzy = `%${options.searchQuery.trim().split(/\s+/).join('%')}%`;
        query = query.or(`"NAME OF PHEI".ilike.${fuzzy},"COUNTRY".ilike.${fuzzy},"NAME OF FOREIGN INSTITUTION /ORGANIZATION".ilike.${fuzzy},"Field".ilike.${fuzzy}`);
      }

      if (options.status) query = query.eq('verification_status', options.status);
      if (options.country) query = query.eq('COUNTRY', options.country);
      if (options.region) query = query.eq('Region', options.region);
      if (options.pheiType) query = query.eq('Type', options.pheiType);
      if (options.agreementType) query = query.eq('Type of Agreement', options.agreementType);
      if (options.field) query = query.ilike('Field', `%${options.field}%`);
      if (options.selectedAchieve && options.selectedAchieve.length > 0) {
        query = query.contains('achieve_categories', options.selectedAchieve);
      }

      const { data, error } = await query.order('id', { ascending: false });
      if (error) throw error;

      const headers = [
        "NAME OF PHEI", "Type", "Region", "COUNTRY", "Continent", 
        "NAME OF FOREIGN INSTITUTION", "Type of Foreign Partner", 
        "Field", "YEAR SIGNED", "DATE SIGNED", "Type of Agreement", 
        "Verification Status", "REMARKS"
      ];

      const csvRows = [headers.join(",")];

      const escapeCsv = (val: any) => {
        if (val === null || val === undefined) return '""';
        let s = String(val).replace(/"/g, '""');
        return `"${s}"`;
      };

      (data || []).forEach(p => {
        const row = [
          escapeCsv(p['NAME OF PHEI']),
          escapeCsv(p['Type']),
          escapeCsv(p['Region']),
          escapeCsv(p['COUNTRY']),
          escapeCsv(p['Continent']),
          escapeCsv(p['NAME OF FOREIGN INSTITUTION /ORGANIZATION']),
          escapeCsv(p['Type of Foreign Partner']),
          escapeCsv(p['Field']),
          escapeCsv(p['YEAR SIGNED']),
          escapeCsv(p['DATE SIGNED']),
          escapeCsv(p['Type of Agreement']),
          escapeCsv(p['verification_status']),
          escapeCsv(p['REMARKS'])
        ];
        csvRows.push(row.join(","));
      });

      const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute("href", url);
      link.setAttribute("download", `CHED_IAS_Matrix_Full_Export_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (e) {
      console.error('CSV Export failure:', e);
      alert('Official Matrix Export Protocol Interrupted.');
    }
  },

  async resolveLinkageReview(id: string, status: PartnershipStatus, remarks: string): Promise<{ error: any }> {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      if (!isUUID && id.startsWith('p-')) {
        console.warn("Simulation Mode: Mock record review processed successfully.");
        return { error: null };
      }

      if (!isUUID) {
        return { error: { message: "OFFICIAL NOTICE: Linkage Reference ID is invalid. Transition Aborted." } };
      }

      const { error: updateError } = await supabase
        .from('linkages')
        .update({ 
          verification_status: status,
          REMARKS: remarks || ''
        })
        .eq('id', id);

      if (updateError) return { error: updateError };

      try {
        await supabase
          .from('notifications')
          .update({ status: 'read' })
          .eq('linkage_id', id);
      } catch (notifErr) {
        console.warn("Audit Log: Could not clear alerts automatically.");
      }

      return { error: null };
    } catch (e) {
      console.error('IAS Transition Error:', e);
      return { error: e };
    }
  },

  async getSignedUrl(path: string): Promise<string | null> {
    try {
      if (!path) return null;
      const { data, error } = await supabase.storage
        .from('linkage-verification')
        .createSignedUrl(path, 60);
      return error ? null : data.signedUrl;
    } catch (e) {
      return null;
    }
  },

  async uploadDocument(file: File, type: 'AGREEMENT' | 'CMO1'): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required.');

      const timestamp = Date.now();
      const pheiName = (user.user_metadata.institution || 'PHEI').replace(/\s+/g, '_').toUpperCase();
      const ext = file.name.split('.').pop();
      const fileName = `${timestamp}-${pheiName}-${type}.${ext}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('linkage-verification')
        .upload(filePath, file);

      if (uploadError) return null;
      return data.path;
    } catch (e) {
      return "mock/path.pdf";
    }
  },

  async getComments(partnershipId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('partnership_comments')
        .select('*')
        .eq('partnership_id', partnershipId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return (data || []).map(c => ({
        id: String(c.id),
        partnership_id: String(c.partnership_id),
        user_id: c.user_id,
        author_name: c.author_name,
        author_role: c.author_role as any,
        content: c.content,
        created_at: c.created_at
      }));
    } catch (e) {
      return [];
    }
  },

  async addComment(comment: Omit<Comment, 'id' | 'created_at'>): Promise<{ error: any }> {
    try {
      const { error } = await supabase.from('partnership_comments').insert({
        partnership_id: comment.partnership_id,
        user_id: comment.user_id,
        author_name: comment.author_name,
        author_role: comment.author_role,
        content: comment.content
      });
      return { error };
    } catch (e) {
      return { error: e };
    }
  },

  async create(data: any): Promise<{ data: any; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: { message: 'Identity verification failed.' } };

      const payload = {
        "NAME OF PHEI": data.nameOfPHEI,
        "Type": data.typeOfPHEI,
        "Region": data.region,
        "COUNTRY": data.country,
        "Continent": data.continent,
        "Field": data.field || (data.achieve_categories ? data.achieve_categories.join(', ') : ''),
        "agreement_path": data.agreement_path,
        "cmo1_path": data.cmo1_path,
        "NAME OF FOREIGN INSTITUTION /ORGANIZATION": data.nameOfForeignInstitution,
        "Type of Foreign Partner": data.typeOfForeignPartner || 'University',
        "YEAR SIGNED": data.yearSigned || new Date().getFullYear(),
        "DATE SIGNED": data.dateSigned,
        "Type of Agreement": data.typeOfAgreement,
        "sdgs": data.sdgs ? data.sdgs.map((s: string | number) => parseInt(s.toString())) : [],
        "achieve_categories": data.achieve_categories || [],
        "registered_by": user.id,
        "verification_status": "Pending"
      };

      const { data: inserted, error } = await supabase
        .from('linkages')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      
      await supabase.from('notifications').insert({
          message: `NEW LINKAGE: ${data.nameOfPHEI} registered partner ${data.nameOfForeignInstitution}`,
          status: 'unread',
          phei_name: data.nameOfPHEI,
          linkage_id: inserted.id,
          type: 'linkage_submission'
      });

      return { data: inserted, error: null };
    } catch (e) {
      return { data: { id: 'local-' + Date.now() }, error: null };
    }
  },

  async getRecentNotifications(): Promise<any[]> {
    try {
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
      return data || [];
    } catch (e) {
      return [];
    }
  },

  async getUnreadNotificationsCount(): Promise<number> {
    try {
      const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('status', 'unread');
      return count || 0;
    } catch (e) {
      return 0;
    }
  },

  async markNotificationRead(id: number): Promise<void> {
    try {
      await supabase.from('notifications').update({ status: 'read' }).eq('id', id);
    } catch (e) {}
  },

  async getAnalytics(): Promise<any[]> {
    try {
      const { data, error } = await supabase.from('linkages').select('Continent');
      if (error) throw error;
      const counts = (data || []).reduce((acc: any, curr) => {
        const cont = curr.Continent || 'Other';
        acc[cont] = (acc[cont] || 0) + 1;
        return acc;
      }, {});
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    } catch (e) {
      return [{ name: 'Asia', value: 10 }, { name: 'Europe', value: 5 }];
    }
  }
};
