export const extractLegalEntities = (text) => {
  if (!text || text.trim().length === 0) {
    console.log('No text provided for entity extraction');
    return { acts: [], sections: [], parties: [], dates: [], courts: [] };
  }

  console.log('Extracting entities from text length:', text.length);

  const entities = {
    acts: [],
    sections: [],
    parties: [],
    dates: [],
    courts: []
  };

  // ACTS - Very aggressive pattern
  const actPatterns = [
    /([A-Z][A-Za-z\s]+(?:Act|Code|Law|Statute|Ordinance|Constitution|Charter|Treaty|Convention|Protocol|Regulation|Directive|Bill|Amendment)(?:[,\s]+\d{4})?)/gi,
    /([A-Z][A-Za-z\s]+(?:Agreement|Contract|Deed|Memorandum|Understanding|Settlement|Arrangement|Covenant|Indenture|Lease|License))/gi
  ];

  actPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      const cleaned = match.trim();
      if (cleaned.length > 8 && !entities.acts.includes(cleaned)) {
        entities.acts.push(cleaned);
      }
    });
  });

  // SECTIONS - Very comprehensive
  const sectionPatterns = [
    /Section\s+\d+[A-Za-z]?(?:\s*\([^)]+\))?/gi,
    /Article\s+\d+[A-Za-z]?(?:\s*\([^)]+\))?/gi,
    /Rule\s+\d+[A-Za-z]?(?:\s*\([^)]+\))?/gi,
    /Clause\s+\d+[A-Za-z]?(?:\s*\([^)]+\))?/gi,
    /Para(?:graph)?\s+\d+[A-Za-z]?/gi,
    /Chapter\s+\d+[A-Za-z]?/gi,
    /Part\s+\d+[A-Za-z]?/gi,
    /Schedule\s+\d+[A-Za-z]?/gi
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

  // DATES - All possible formats
  const datePatterns = [
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
    /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi,
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?[,\s]+\d{4}\b/gi,
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\s+\d{1,2}[,\s]+\d{4}\b/gi,
    /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g
  ];

  datePatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      const cleaned = match.trim();
      if (!entities.dates.includes(cleaned)) {
        entities.dates.push(cleaned);
      }
    });
  });

  // COURTS - Comprehensive list
  const courtPatterns = [
    /Supreme Court(?:\s+of\s+[A-Za-z\s]+)?/gi,
    /High Court(?:\s+of\s+[A-Za-z\s]+)?/gi,
    /District Court(?:\s+of\s+[A-Za-z\s]+)?/gi,
    /Sessions Court/gi,
    /Magistrate(?:'s)?\s+Court/gi,
    /Civil Court/gi,
    /Criminal Court/gi,
    /Family Court/gi,
    /Labour Court/gi,
    /Consumer Court/gi,
    /Tribunal/gi,
    /Court of [A-Za-z\s]+/gi,
    /Appellate Court/gi,
    /Trial Court/gi
  ];

  courtPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      const cleaned = match.trim();
      if (!entities.courts.includes(cleaned)) {
        entities.courts.push(cleaned);
      }
    });
  });

  // PARTIES - Multiple comprehensive patterns
  const partyPatterns = [
    // Mr./Ms./Mrs./Dr. Names
    /(?:Mr|Ms|Mrs|Dr|Prof|Hon|Justice|Judge|Advocate|Shri|Smt|Kumar|Singh|Sharma|Patel|Gupta|Verma|Shah|Jain|Agarwal|Reddy|Rao|Nair|Iyer|Menon|Das|Bose|Ghosh|Mukherjee|Banerjee|Chatterjee|Sen|Roy|Dutta|Malhotra|Kapoor|Chopra|Mehta|Desai|Kulkarni|Joshi|Naik|Pillai|Khan|Ali|Ahmed|Hussain|Mohammad|Rahman|Ansari|Siddiqui|Qureshi|Malik|Sheikh)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}/g,
    // Names in vs/versus
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\s+(?:vs?\.?|versus|v\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/g,
    // Legal roles
    /(?:the\s+)?(?:Plaintiff|Defendant|Petitioner|Respondent|Appellant|Appellee|Complainant|Accused|Convict|Witness|Claimant|Applicant|Seller|Buyer|Vendor|Purchaser|Lessor|Lessee|Landlord|Tenant|Licensor|Licensee|Grantor|Grantee|Mortgagor|Mortgagee|Debtor|Creditor|Trustee|Beneficiary|Executor|Administrator|Guardian|Ward|Principal|Agent|Employer|Employee|Contractor|Client|Party|Parties)(?:\s+of\s+the\s+(?:First|Second|Third|Fourth)\s+Part)?/gi,
    // Company names
    /[A-Z][A-Za-z\s&]+(?:Ltd|Limited|Inc|Incorporated|Corp|Corporation|LLC|LLP|Pvt|Private|Public|Company|Co|Enterprises|Industries|Services|Solutions|Technologies|Group|Holdings|Partners|Associates|Firm)/g
  ];

  partyPatterns.forEach(pattern => {
    if (pattern.source.includes('vs')) {
      // Handle vs pattern specially
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1] && match[1].trim().length > 2) entities.parties.push(match[1].trim());
        if (match[2] && match[2].trim().length > 2) entities.parties.push(match[2].trim());
      }
    } else {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const cleaned = match.trim();
        if (cleaned.length > 2 && !entities.parties.includes(cleaned)) {
          entities.parties.push(cleaned);
        }
      });
    }
  });

  // Remove duplicates and clean up
  entities.acts = [...new Set(entities.acts)].filter(a => a && a.length > 0);
  entities.sections = [...new Set(entities.sections)].filter(s => s && s.length > 0);
  entities.parties = [...new Set(entities.parties)].filter(p => p && p.length > 2);
  entities.dates = [...new Set(entities.dates)].filter(d => d && d.length > 0);
  entities.courts = [...new Set(entities.courts)].filter(c => c && c.length > 0);

  console.log('Extracted entities:', {
    acts: entities.acts.length,
    sections: entities.sections.length,
    parties: entities.parties.length,
    dates: entities.dates.length,
    courts: entities.courts.length
  });

  console.log('Sample entities:', {
    acts: entities.acts.slice(0, 3),
    sections: entities.sections.slice(0, 3),
    parties: entities.parties.slice(0, 3),
    dates: entities.dates.slice(0, 3),
    courts: entities.courts.slice(0, 3)
  });

  return entities;
};
