import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

const ACCENT = '#2b6f4a';
const INK = '#1a1a1a';
const MUTED = '#6b7280';
const SOFT = '#374151';
const LINE = '#e5e7eb';
const BG_ACCENT = '#f0faf4';

const s = StyleSheet.create({
  page: { backgroundColor: '#fff', paddingHorizontal: 44, paddingVertical: 40, fontFamily: 'Helvetica', fontSize: 10, color: INK },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  name: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: INK },
  role: { fontSize: 12, color: ACCENT, marginTop: 3 },
  contactCol: { alignItems: 'flex-end' },
  contactItem: { fontSize: 8.5, color: MUTED, marginBottom: 2 },

  divider: { height: 1, backgroundColor: LINE, marginVertical: 14 },
  thickDivider: { height: 2, backgroundColor: ACCENT, marginBottom: 14 },

  // Section
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: ACCENT, letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 10, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: ACCENT },

  // Experience
  expRow: { flexDirection: 'row', marginBottom: 14 },
  expYear: { width: 84, fontSize: 8, color: MUTED, paddingTop: 1.5, flexShrink: 0 },
  expContent: { flex: 1 },
  expRole: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: INK, marginBottom: 1 },
  expCompany: { fontSize: 9, color: ACCENT, marginBottom: 3 },
  expDesc: { fontSize: 8.5, color: SOFT, lineHeight: 1.45 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5, gap: 4 },
  tag: { fontSize: 7, color: MUTED, borderWidth: 0.5, borderColor: LINE, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  award: { fontSize: 8, color: '#b45309', marginTop: 3, fontFamily: 'Helvetica-Bold' },

  // Skills / Education
  twoCol: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skillGroup: { width: '47%', marginBottom: 8 },
  skillGroupName: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: INK, marginBottom: 3, paddingBottom: 2, borderBottomWidth: 0.5, borderBottomColor: LINE },
  skillItems: { fontSize: 8, color: SOFT, lineHeight: 1.5 },

  // Footer
  footer: { position: 'absolute', bottom: 24, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7.5, color: MUTED },

  // Highlight band
  highlightBand: { backgroundColor: BG_ACCENT, padding: 10, borderRadius: 4, marginBottom: 18, flexDirection: 'row', gap: 16 },
  highlightItem: { flex: 1 },
  highlightLabel: { fontSize: 7, color: ACCENT, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 },
  highlightValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: INK },
});

export type CvPdfData = {
  cv: {
    experience: {
      id: string;
      year: string;
      role: string;
      company: string;
      description: { es: string; en: string };
      tags?: string[];
      award?: { es: string; en: string };
    }[];
    skills: { group: string; items: string[] }[];
    education: { group: string; items: string[] }[];
  };
  site: {
    name: string;
    role: string;
    email: string;
    linkedin: string;
    location?: string;
    expValue?: string;
  };
};

export function CvPDF({ cv, site }: CvPdfData) {
  const location = site.location || 'Madrid · Remoto OK';
  const expValue = site.expValue || '';

  return (
    <Document title={`CV — ${site.name}`} author={site.name} creator="cesarheredero.com" subject="Curriculum Vitae">
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.name}>{site.name}</Text>
            <Text style={s.role}>{site.role}</Text>
          </View>
          <View style={s.contactCol}>
            <Text style={s.contactItem}>{site.email}</Text>
            <Text style={s.contactItem}>linkedin.com/in/cesarheredero</Text>
            <Text style={s.contactItem}>cesarheredero.com</Text>
          </View>
        </View>

        <View style={s.thickDivider} />

        {/* ── Highlight band ── */}
        {(expValue || location) && (
          <View style={s.highlightBand}>
            {expValue ? (
              <View style={s.highlightItem}>
                <Text style={s.highlightLabel}>Experiencia</Text>
                <Text style={s.highlightValue}>{expValue}</Text>
              </View>
            ) : null}
            <View style={s.highlightItem}>
              <Text style={s.highlightLabel}>Ubicación</Text>
              <Text style={s.highlightValue}>{location}</Text>
            </View>
            <View style={s.highlightItem}>
              <Text style={s.highlightLabel}>Disponibilidad</Text>
              <Text style={s.highlightValue}>Abierto a ofertas</Text>
            </View>
            <View style={s.highlightItem}>
              <Text style={s.highlightLabel}>Idiomas</Text>
              <Text style={s.highlightValue}>Español · Inglés</Text>
            </View>
          </View>
        )}

        {/* ── Experience ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Experiencia profesional</Text>
          {cv.experience.map((exp) => (
            <View key={exp.id} style={s.expRow} wrap={false}>
              <Text style={s.expYear}>{exp.year}</Text>
              <View style={s.expContent}>
                <Text style={s.expRole}>{exp.role}</Text>
                <Text style={s.expCompany}>{exp.company}</Text>
                <Text style={s.expDesc}>{exp.description.es}</Text>
                {exp.award && (
                  <Text style={s.award}>★ {exp.award.es}</Text>
                )}
                {exp.tags && exp.tags.length > 0 && (
                  <View style={s.tagsRow}>
                    {exp.tags.map((tag) => (
                      <Text key={tag} style={s.tag}>{tag}</Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* ── Skills ── */}
        {cv.skills.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Habilidades</Text>
            <View style={s.twoCol}>
              {cv.skills.map((group) => (
                <View key={group.group} style={s.skillGroup}>
                  <Text style={s.skillGroupName}>{group.group}</Text>
                  <Text style={s.skillItems}>{group.items.join(' · ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Education ── */}
        {cv.education.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Formación continua</Text>
            <View style={s.twoCol}>
              {cv.education.map((group) => (
                <View key={group.group} style={s.skillGroup}>
                  <Text style={s.skillGroupName}>{group.group}</Text>
                  <Text style={s.skillItems}>{group.items.join(' · ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>cesarheredero.com</Text>
          <Text style={s.footerText}>© 2026 César Heredero Herranz</Text>
        </View>

      </Page>
    </Document>
  );
}
