export function generateEmailVariants(email: string): string[] {
  const [localPart, domain] = email.split('@');
  const variants = new Set<string>();

  // 1. Original
  variants.add(email);

  // 2. Todo minúsculas
  variants.add(email.toLowerCase());

  // 3. Todo mayúsculas
  variants.add(email.toUpperCase());

  // 4. Primera letra mayúscula, resto minúsculas
  variants.add(
    localPart.charAt(0).toUpperCase() + 
    localPart.slice(1).toLowerCase() + 
    '@' + domain.toLowerCase()
  );

  // 5. Cada palabra capitalizada (incluyendo después de números y caracteres especiales)
  const capitalizedLocal = localPart
    .split(/([0-9]+|[._-])/g)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
  variants.add(capitalizedLocal + '@' + domain.toLowerCase());

  // 6. Parte local mayúsculas, dominio minúsculas
  variants.add(localPart.toUpperCase() + '@' + domain.toLowerCase());

  // 7. Parte local minúsculas, dominio mayúsculas
  variants.add(localPart.toLowerCase() + '@' + domain.toUpperCase());

  // 8. Parte local capitalizada, dominio mayúsculas
  variants.add(capitalizedLocal + '@' + domain.toUpperCase());

  // 9. Primera letra mayúscula resto minúscula, dominio mayúsculas
  variants.add(
    localPart.charAt(0).toUpperCase() + 
    localPart.slice(1).toLowerCase() + 
    '@' + domain.toUpperCase()
  );

  // 10. Capitalize después de cada separador (punto, guión bajo, guión)
  const afterSeparatorCapitalized = localPart
    .split(/([._-])/)
    .map((part, index, array) => {
      // Si es un separador, manténlo igual
      if (part.match(/[._-]/)) return part;
      // Si viene después de un separador o es el primer elemento, capitaliza
      return index === 0 || array[index - 1].match(/[._-]/) 
        ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        : part.toLowerCase();
    })
    .join('');
  variants.add(afterSeparatorCapitalized + '@' + domain.toLowerCase());
  variants.add(afterSeparatorCapitalized + '@' + domain.toUpperCase());

  // 11. Capitalize primera letra de cada segmento numérico
  const numericSegmentsCapitalized = localPart
    .split(/(\d+)/)
    .map(part => {
      if (part.match(/^\d+$/)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('');
  variants.add(numericSegmentsCapitalized + '@' + domain.toLowerCase());
  variants.add(numericSegmentsCapitalized + '@' + domain.toUpperCase());

  // 12. Solo dominio capitalizado
  variants.add(
    localPart.toLowerCase() + '@' + 
    domain.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    ).join('.')
  );

  // 13. Alternancia de mayúsculas y minúsculas
  const alternatingCase = localPart
    .split('')
    .map((char, index) => 
      index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
    )
    .join('');
  variants.add(alternatingCase + '@' + domain.toLowerCase());

  // 14. Cada subsegmento después de un número capitalizado
  if (localPart.match(/\d/)) {
    const afterNumberCapitalized = localPart
      .split(/(\d+)/)
      .map((part, index, array) => {
        if (part.match(/^\d+$/)) return part;
        return index > 0 && array[index - 1].match(/^\d+$/)
          ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          : part.toLowerCase();
      })
      .join('');
    variants.add(afterNumberCapitalized + '@' + domain.toLowerCase());
    variants.add(afterNumberCapitalized + '@' + domain.toUpperCase());
  }

  // 15. Dominio con primera letra de cada parte capitalizada
  const capitalizedDomain = domain
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('.');
  variants.add(localPart.toLowerCase() + '@' + capitalizedDomain);
  variants.add(localPart.toUpperCase() + '@' + capitalizedDomain);
  variants.add(capitalizedLocal + '@' + capitalizedDomain);

  return Array.from(variants);
}
