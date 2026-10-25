import { HttpParams } from '@angular/common/http';

/**
 * Build HttpParams from a filter object, excluding null/undefined/empty values
 */
export function buildQueryParams(filters: Record<string, any>): HttpParams {
  let params = new HttpParams();
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params = params.set(key, value.join(','));
        }
      } else {
        params = params.set(key, value.toString());
      }
    }
  }
  
  return params;
}

/**
 * Map backend variety response to frontend Variety interface
 * This is a centralized mapping function that can be reused
 */
export function mapBackendVarietyToFrontend(apiVariety: any): any {
  return {
    // Basic fields
    uid: apiVariety.uid,
    cropName: apiVariety.cropName,
    varietyReleaseName: apiVariety.varietyReleaseName,
    releaseEntityOwner: apiVariety.releaseEntityOwner,
    varietyType: apiVariety.varietyType,
    productionAltitudeMin: apiVariety.productionAltitudeMin,
    productionAltitudeMax: apiVariety.productionAltitudeMax,
    productionAltitude: apiVariety.productionAltitudeMin && apiVariety.productionAltitudeMax
      ? `${apiVariety.productionAltitudeMin}-${apiVariety.productionAltitudeMax} m`
      : apiVariety.productionAltitudeMin
      ? `Min: ${apiVariety.productionAltitudeMin} m`
      : apiVariety.productionAltitudeMax
      ? `Max: ${apiVariety.productionAltitudeMax} m`
      : '',
    maintainer: apiVariety.maintainerCenterName || apiVariety.maintainer || '',
    maintainerCenterName: apiVariety.maintainerCenterName,
    maintainerCenterId: apiVariety.maintainerCenterId,
    maintenanceStatus: apiVariety.maintenanceStatus,
    potentialYieldMin: apiVariety.potentialYieldMin,
    potentialYieldMax: apiVariety.potentialYieldMax,
    potentialYield: apiVariety.potentialYieldMin && apiVariety.potentialYieldMax
      ? `${apiVariety.potentialYieldMin}-${apiVariety.potentialYieldMax}`
      : apiVariety.potentialYieldMin
      ? `${apiVariety.potentialYieldMin}`
      : apiVariety.potentialYieldMax
      ? `${apiVariety.potentialYieldMax}`
      : '',
    specialAttributes: apiVariety.specialAttributes,
    botanicalName: apiVariety.botanicalName,
    typeOfLicense: apiVariety.typeOfLicense,
    color: apiVariety.color,
    limitation: apiVariety.limitation,
    commonName: apiVariety.commonName,
    maturityDays: apiVariety.maturityDays,
    yearOfRelease: apiVariety.yearOfRelease,
    distinctiveCharacters: apiVariety.distinctiveCharacters,
    regionNames: apiVariety.regionNames || [],
    imageUrls: apiVariety.imageUrls || [],
    
    // A. Variety identification
    varietyOriginalCode: apiVariety.varietyOriginalCode,
    registeredName: apiVariety.registeredName,
    localName: apiVariety.localName,
    
    // B. Morphological characteristics
    growthHabit: apiVariety.growthHabit,
    plantHeight: apiVariety.plantHeight,
    flowerColor: apiVariety.flowerColor,
    seedShape: apiVariety.seedShape,
    seedColor: apiVariety.seedColor,
    seedSize: apiVariety.seedSize,
    
    // C. Growing areas
    rainfallMin: apiVariety.rainfallMin,
    rainfallMax: apiVariety.rainfallMax,
    
    // D. Agronomic traits
    daysTo50PercentFlowering: apiVariety.daysTo50PercentFlowering,
    seedRateKgPerHa: apiVariety.seedRateKgPerHa,
    
    // E. GAP by crop
    spacingCm: apiVariety.spacingCm,
    soilType: apiVariety.soilType,
    plantingCalendar: apiVariety.plantingCalendar,
    diseaseAndPestManagement: apiVariety.diseaseAndPestManagement,
    postHarvestManagement: apiVariety.postHarvestManagement,
    croppingSystem: apiVariety.croppingSystem,
    fertilizerRate: apiVariety.fertilizerRate,
    
    // F. Reaction to biotic stresses
    diseases: apiVariety.diseases,
    pests: apiVariety.pests,
    
    // G. Reaction to abiotic stress
    temperatureStress: apiVariety.temperatureStress,
    heatStress: apiVariety.heatStress,
    droughtStress: apiVariety.droughtStress,
    floodStress: apiVariety.floodStress,
    
    // H. Utilization
    uses: apiVariety.uses,
    nutritionContent: apiVariety.nutritionContent,
    availability: apiVariety.availability,
    alternativeVarieties: apiVariety.alternativeVarieties,
    leadingCentreContacts: apiVariety.leadingCentreContacts,
    
    // Legacy fields
    commercialisationLevel: apiVariety.commercialisationLevel,
    recommendedAgriculturalEcologicalZones: apiVariety.recommendedAgriculturalEcologicalZones
  };
}

/**
 * Map backend product response to frontend Product interface
 */
export function mapBackendProductToFrontend(apiProduct: any, apiBaseUrl?: string): any {
  return {
    id: apiProduct.uid || apiProduct.id,
    uid: apiProduct.uid,
    name: apiProduct.name,
    description: apiProduct.description,
    imageUrl: apiProduct.imageUrl || (apiProduct.imageObjectName && apiProduct.uid
      ? `${apiBaseUrl || ''}/products/${apiProduct.uid}/image`
      : undefined),
    imageObjectName: apiProduct.imageObjectName,
    categoryId: apiProduct.categoryId || apiProduct.category?.uid,
    category: apiProduct.categoryName || apiProduct.category?.name,
    categoryName: apiProduct.categoryName || apiProduct.category?.name,
    active: apiProduct.active,
    varieties: apiProduct.varieties || []
  };
}
