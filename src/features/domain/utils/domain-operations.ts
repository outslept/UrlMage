import { ValidationError } from "../../../errors";
import { ErrorCode } from "../../../errors/types";
import { DomainInfo, IpAddress } from "../types/domain";

export interface IDomainHandler {
  parse(domain: string): DomainInfo;    // Parses a domain string into structured information
  parseIP(ip: string): IpAddress;       // Parses an IP address string into structured information
  normalize(domain: string): string;    // Normalizes domain format for consistent processing
  toPunycode(domain: string): string;   // Converts internationalized domain names to ASCII (Punycode)
  fromPunycode(domain: string): string; // Converts Punycode domains back to Unicode representation
}

export class DomainOperations {
  constructor(private readonly domainHandler: IDomainHandler) {}

  // Extracts the root domain (registrable part + TLD) from a domain string
  public getRootDomain(domain: string): string {
    const info = this.domainHandler.parse(domain);
    // If it's an IP address, return it unchanged
    if (info.isIp) {
      return domain;
    }

    // Find the registrable part (SLD) and the TLD
    const registrablePart = info.parts.find((part) => part.isRegistrable);
    const tldPart = info.parts.find((part) => part.isPublicSuffix);

    // If either part is missing, return the original domain
    if (!registrablePart || !tldPart) {
      return domain;
    }

    // Combine the registrable part and TLD to form the root domain
    return `${registrablePart.name}.${tldPart.name}`;
  }

  // Extracts all subdomains from a domain string
  public getSubdomains(domain: string): string[] {
    const info = this.domainHandler.parse(domain);
    // IP addresses don't have subdomains
    if (info.isIp) {
      return [];
    }
    // Return all parts that are neither the TLD nor the registrable part
    return info.parts
      .filter((part) => !part.isPublicSuffix && !part.isRegistrable)
      .map((part) => part.name);
  }

  // Adds a subdomain to an existing domain
  public addSubdomain(domain: string, subdomain: string): string {
    const info = this.domainHandler.parse(domain);
    // Cannot add subdomain to IP addresses
    if (info.isIp) {
      throw new ValidationError(
        "Cannot add subdomain to IP address",
        ErrorCode.INVALID_OPERATION
      );
    }

    // Validate subdomain format using regex
    // Must start and end with alphanumeric characters and can contain hyphens in between
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(subdomain)) {
      throw new ValidationError(
        "Invalid subdomain. Must start and end with alphanumeric characters and can contain hyphens in between.",
        ErrorCode.INVALID_HOSTNAME
      );
    }

    // Prepend the subdomain to the domain
    return `${subdomain}.${domain}`;
  }

  // Removes the leftmost subdomain from a domain
  public removeSubdomain(domain: string): string {
    const info = this.domainHandler.parse(domain);
    // IP addresses don't have subdomains to remove
    if (info.isIp) {
      return domain;
    }

    const parts = info.parts;
    // If there are only two or fewer parts (e.g., example.com), nothing to remove
    if (parts.length <= 2) {
      return domain;
    }

    // Remove the first part (leftmost subdomain) and join the rest
    return parts
      .slice(1)
      .map((part) => part.name)
      .join(".");
  }

  // Replaces all subdomains with a new one
  public replaceSubdomains(domain: string, newSubdomain: string): string {
    const info = this.domainHandler.parse(domain);
    // Cannot replace subdomains in IP addresses
    if (info.isIp) {
      throw new ValidationError(
        "Cannot replace subdomains in IP address",
        ErrorCode.INVALID_OPERATION
      );
    }

    // Get the root domain and add the new subdomain to it
    const rootDomain = this.getRootDomain(domain);
    return this.addSubdomain(rootDomain, newSubdomain);
  }

  // Returns the number of subdomain levels
  public getSubdomainDepth(domain: string): number {
    return this.getSubdomains(domain).length;
  }

  // Checks if one domain is a subdomain of another
  public isSubdomainOf(domain: string, parentDomain: string): boolean {
    const domainInfo = this.domainHandler.parse(domain);
    const parentInfo = this.domainHandler.parse(parentDomain);

    // IP addresses can't have subdomain relationships
    if (domainInfo.isIp || parentInfo.isIp) {
      return false;
    }

    // Both domains must share the same root domain
    const domainRoot = this.getRootDomain(domain);
    const parentRoot = this.getRootDomain(parentDomain);

    if (domainRoot !== parentRoot) {
      return false;
    }

    // The potential subdomain must have more subdomain parts than the parent
    const domainSubs = this.getSubdomains(domain);
    const parentSubs = this.getSubdomains(parentDomain);

    if (domainSubs.length <= parentSubs.length) {
      return false;
    }

    // The domain must end with the parent domain
    return domain.endsWith(`.${parentDomain}`);
  }

  // Checks if two domains use visually similar characters (homoglyphs)
  private isHomoglyphAttack(domain1: string, domain2: string): boolean {
    // Dictionary of characters and their visually similar alternatives
    const homoglyphs: Record<string, string[]> = {
      a: ["а", "ą", "à", "á", "â", "ã", "ä", "å", "ɑ"],
      b: ["d", "lb", "ib", "ʙ", "Ь", "ß", "ɓ"],
      c: ["ϲ", "с", "ƈ"],
      d: ["b", "cl", "dl", "ԁ", "ɗ"],
      e: ["е", "ē", "ĕ", "ė", "ę", "ё", "є", "ə", "ɇ"],
      g: ["q", "ɢ", "ɡ", "ց"],
      h: ["һ", "հ", "Ꮒ"],
      i: ["1", "l", "|", "í", "ï", "ı", "ɩ"],
      j: ["ј", "ʝ"],
      k: ["κ", "к", "ⲕ", "ḳ"],
      l: ["1", "i", "|", "ⅼ", "ӏ", "ḷ"],
      m: ["n", "nn", "rn", "rr", "ṃ"],
      n: ["m", "r", "ń", "ņ", "ṇ", "ṅ"],
      o: ["0", "о", "ο", "ө", "ō", "ȯ", "ọ", "ỏ", "ơ"],
      p: ["р", "ρ", "ṗ", "ṕ"],
      q: ["g", "զ"],
      r: ["ʀ", "ɼ", "ɽ"],
      s: ["ѕ", "ś", "ṣ", "ṡ"],
      t: ["τ", "т", "ţ", "ṭ", "ț"],
      u: ["μ", "υ", "ц", "ù", "ú", "û", "ü", "ǔ", "ụ"],
      v: ["ν", "v", "ѵ"],
      w: ["vv", "ѡ", "ԝ", "ẁ", "ẃ", "ẅ"],
      x: ["х", "ҳ", "ẋ"],
      y: ["ү", "ƴ", "ỷ", "ỵ", "ỳ", "ý"],
      z: ["ʐ", "ż", "ź", "ʐ", "ᴢ"],
    };

    // Domains must be the same length for homoglyph comparison
    if (domain1.length !== domain2.length) {
      return false;
    }

    let homoglyphCount = 0;

    // Compare each character position
    for (let i = 0; i < domain1.length; i++) {
      if (domain1[i] === domain2[i]) {
        continue;
      }

      let isHomoglyph = false;

      // Check if the characters at this position are known homoglyphs
      for (const [char, variants] of Object.entries(homoglyphs)) {
        if (
          (domain1[i] === char && variants.includes(domain2[i])) ||
          (domain2[i] === char && variants.includes(domain1[i]))
        ) {
          isHomoglyph = true;
          homoglyphCount++;
          break;
        }
      }

      // If any character difference is not a homoglyph, it's not a homoglyph attack
      if (!isHomoglyph) {
        return false;
      }
    }

    // It's a homoglyph attack if at least one homoglyph was found
    return homoglyphCount > 0;
  }

  // Checks if two domains differ only in their TLD
  private isTLDVariation(domain1: string, domain2: string): boolean {
    const info1 = this.domainHandler.parse(domain1);
    const info2 = this.domainHandler.parse(domain2);

    // IP addresses don't have TLDs
    if (info1.isIp || info2.isIp) {
      return false;
    }

    // Get the SLD (Second Level Domain) for both domains
    const sld1 = info1.sld ?? "";
    const sld2 = info2.sld ?? "";

    // If SLDs are identical but TLDs differ, it's a TLD variation
    if (sld1 === sld2 && info1.tld !== info2.tld) {
      return true;
    }

    return false;
  }

  // Analyzes how similar two domains are and detects typosquatting attempts
  public analyzeDomainSimilarity(
    domain1: string,
    domain2: string
  ): {
    similarity: number;
    typosquatting: boolean;
    reason?: string;
  } {
    // Normalize domains for consistent comparison
    const normalized1 = this.domainHandler.normalize(domain1);
    const normalized2 = this.domainHandler.normalize(domain2);

    // Get root domains (without subdomains)
    const root1 = this.getRootDomain(normalized1);
    const root2 = this.getRootDomain(normalized2);

    // If root domains are identical, they're the same domain
    if (root1 === root2) {
      return { similarity: 1, typosquatting: false };
    }

    // Calculate Levenshtein distance (edit distance between strings)
    const levenshtein = this.calculateLevenshteinDistance(root1, root2);

    // Calculate similarity coefficient (0-1 scale)
    const maxLength = Math.max(root1.length, root2.length);
    const similarity = 1 - levenshtein / maxLength;

    let typosquatting = false;
    let reason: string | undefined = undefined;

    // Check for common typosquatting patterns
    if (levenshtein === 1) {
      // One character difference (addition, deletion, or substitution)
      typosquatting = true;
      reason = "One character substitution, addition, or deletion";
    } else if (this.isCharacterSwap(root1, root2)) {
      // Adjacent character transposition (e.g., "gogole" instead of "google")
      typosquatting = true;
      reason = "Adjacent character transposition";
    } else if (this.isHomoglyphAttack(root1, root2)) {
      // Visually similar characters (e.g., using Cyrillic "о" instead of Latin "o")
      typosquatting = true;
      reason = "Use of visually similar characters";
    } else if (this.isTLDVariation(normalized1, normalized2)) {
      // Same domain name but different TLD (e.g., example.com vs example.net)
      typosquatting = true;
      reason = "TLD variation";
    } else if (similarity > 0.8) {
      // High overall similarity but doesn't match specific patterns
      typosquatting = true;
      reason = "High overall similarity";
    }

    return { similarity, typosquatting, reason };
  }

  // Calculates the Levenshtein distance (edit distance) between two strings
  private calculateLevenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    // Initialize the matrix with base values
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    // Fill the matrix using dynamic programming approach
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          // If characters match, no edit needed
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          // Take minimum of three operations: substitution, insertion, deletion
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            Math.min(
              matrix[i][j - 1] + 1, // insertion
              matrix[i - 1][j] + 1 // deletion
            )
          );
        }
      }
    }

    // The bottom-right cell contains the final distance
    return matrix[b.length][a.length];
  }

  // Checks if two domains differ by exactly one character swap
  private isCharacterSwap(domain1: string, domain2: string): boolean {
    // Domains must be the same length for a character swap
    if (Math.abs(domain1.length - domain2.length) !== 0) {
      return false;
    }

    let swaps = 0;
    for (let i = 0; i < domain1.length - 1; i++) {
      // Check for adjacent character swap pattern (xy → yx)
      if (domain1[i] === domain2[i + 1] && domain1[i + 1] === domain2[i]) {
        swaps++;
        // Skip the next character since we've already processed it
        i++;
      } else if (domain1[i] !== domain2[i]) {
        // If characters differ but aren't swapped, it's not a simple swap attack
        return false;
      }
    }

    // It's a character swap attack if exactly one swap was found
    return swaps === 1;
  }
}
