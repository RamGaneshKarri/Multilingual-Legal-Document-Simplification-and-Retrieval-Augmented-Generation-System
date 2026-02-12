// SIMPLE AND RELIABLE ENTITY EXTRACTION

export const extractLegalEntities = (text) => {
  if (!text || text.trim().length === 0) {
    console.log('❌ No text provided');
    return { acts: [], sections: [], parties: [], dates: [], courts: [] };
  }

  console.log('✓ Starting extraction on text length:', text.length);

  const entities = {
    acts: [],
    sections: [],
    parties: [],
    dates: [],
    courts: []
  };

  // LEGAL TERMS - Extract common legal terminology
  const legalTerms = [
    'culpable homicide', 'murder', 'theft', 'robbery', 'assault', 'battery',
    'fraud', 'defamation', 'negligence', 'breach of contract', 'trespass',
    'conspiracy', 'forgery', 'perjury', 'kidnapping', 'extortion',
    'embezzlement', 'bribery', 'contempt of court', 'bail', 'warrant',
    'summons', 'injunction', 'decree', 'judgment', 'appeal', 'petition',
    'plaintiff', 'defendant', 'accused', 'prosecution', 'defense'
  ];

  legalTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    if (regex.test(text)) {
      const capitalizedTerm = term.charAt(0).toUpperCase() + term.slice(1);
      if (!entities.acts.includes(capitalizedTerm)) {
        entities.acts.push(capitalizedTerm);
      }
    }
  });

  // ACTS - Look for capitalized Act/Code/Law
  const actPattern = /[A-Z][A-Za-z\s]+(?:Act|Code|Law|Statute|Constitution)(?:[,\s]+\d{4})?/g;
  const actMatches = text.match(actPattern) || [];
  actMatches.forEach(match => {
    const cleaned = match.trim();
    if (cleaned.length > 8 && !entities.acts.includes(cleaned)) {
      entities.acts.push(cleaned);
    }
  });

  // SECTIONS - Look for Section/Article/Rule followed by number
  const sectionPatterns = [
    /Section\s+\d+[A-Za-z]?/gi,
    /Article\s+\d+[A-Za-z]?/gi,
    /Rule\s+\d+[A-Za-z]?/gi,
    /Clause\s+\d+[A-Za-z]?/gi,
    /Para(?:graph)?\s+\d+/gi,
    /Chapter\s+\d+/gi
  ];

  sectionPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      const cleaned = match.trim();
      if (!entities.sections.includes(cleaned)) {
        entities.sections.push(cleaned);
      }
    });
  });

  // DATES - All formats
  const datePatterns = [
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
    /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi,
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?[,\s]+\d{4}\b/gi
  ];

  datePatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      if (!entities.dates.includes(match.trim())) {
        entities.dates.push(match.trim());
      }
    });
  });

  // COURTS
  const courtKeywords = ['Supreme Court', 'High Court', 'District Court', 'Sessions Court', 'Magistrate', 'Court', 'Tribunal'];
  courtKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    if (regex.test(text)) {
      if (!entities.courts.includes(keyword)) {
        entities.courts.push(keyword);
      }
    }
  });

  // PARTIES - Names and roles
  const titlePattern = /(?:Mr|Ms|Mrs|Dr|Prof|Justice|Judge)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g;
  const titles = text.match(titlePattern) || [];
  titles.forEach(t => {
    if (!entities.parties.includes(t.trim())) {
      entities.parties.push(t.trim());
    }
  });

  // Legal roles
  const roles = ['offender', 'victim', 'witness', 'accused', 'plaintiff', 'defendant', 'petitioner', 'respondent'];
  roles.forEach(role => {
    const regex = new RegExp(`\\b${role}\\b`, 'gi');
    if (regex.test(text)) {
      const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
      if (!entities.parties.includes(capitalizedRole)) {
        entities.parties.push(capitalizedRole);
      }
    }
  });

  // Remove duplicates
  entities.acts = [...new Set(entities.acts)];
  entities.sections = [...new Set(entities.sections)];
  entities.parties = [...new Set(entities.parties)];
  entities.courts = [...new Set(entities.courts)];
  entities.dates = [...new Set(entities.dates)];

  console.log('✓ Extraction complete:');
  console.log('  Acts/Terms:', entities.acts.length, entities.acts.slice(0, 5));
  console.log('  Sections:', entities.sections.length);
  console.log('  Parties:', entities.parties.length, entities.parties.slice(0, 5));
  console.log('  Dates:', entities.dates.length);
  console.log('  Courts:', entities.courts.length);

  return entities;
};
