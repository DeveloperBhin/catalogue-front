import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Variety {
  // Basic identification
  uid?: string;
  productId?: string;
  product?: Product; // Full product object when included
  cropName?: string;
  varietyReleaseName?: string;
  releaseEntityOwner?: string;
  varietyType?: string;
  productionAltitudeMin?: number;
  productionAltitudeMax?: number;
  productionAltitude?: string; // Formatted from min/max (for backward compatibility)
  maintainer?: string;
  maintainerCenterName?: string;
  maintenanceStatus?: string;
  potentialYieldMin?: number;
  potentialYieldMax?: number;
  potentialYield?: string; // Formatted from min/max (for backward compatibility)
  specialAttributes?: string;
  botanicalName?: string;
  typeOfLicense?: string;
  color?: string;
  limitation?: string;
  commonName?: string;
  maturityDays?: number;
  yearOfRelease?: string;
  distinctiveCharacters?: string;
  regionNames?: string[];
  imageUrls?: string[]; // For variety images

  // A. Variety identification - additional fields
  varietyOriginalCode?: string;
  registeredName?: string;
  localName?: string;
  maintainerCenterId?: string;

  // B. Morphological characteristics
  growthHabit?: string;
  plantHeight?: string;
  flowerColor?: string;
  seedShape?: string;
  seedColor?: string;
  seedSize?: string;

  // C. Growing areas - additional fields
  rainfallMin?: number;
  rainfallMax?: number;

  // D. Agronomic traits - additional fields
  daysTo50PercentFlowering?: number;
  seedRateKgPerHa?: number;

  // E. GAP by crop
  spacingCm?: string;
  soilType?: string;
  plantingCalendar?: string;
  diseaseAndPestManagement?: string;
  postHarvestManagement?: string;
  croppingSystem?: string;
  fertilizerRate?: string;

  // F. Reaction to biotic stresses
  diseases?: string;
  pests?: string;

  // G. Reaction to abiotic stress
  temperatureStress?: string;
  heatStress?: string;
  droughtStress?: string;
  floodStress?: string;

  // H. Utilization
  uses?: string;
  nutritionContent?: string;
  availability?: string;
  alternativeVarieties?: string;
  factSheetUrl?: string;
  factSheet?: string;
  factSheetPdf?: string;
  leadingCentreContacts?: string;

  // Legacy fields (optional for backward compatibility)
  commercialisationLevel?: string;
  recommendedAgriculturalEcologicalZones?: string;
}

export interface Product {
  id?: string; // For backward compatibility
  uid?: string; // Primary identifier from backend
  name: string;
  description?: string;
  imageUrl?: string;
  imageObjectName?: string;
  categoryId?: string; // Category UID (UUID) - matches backend
  category?: string; // Category name - keep for compatibility/display
  categoryName?: string; // Category name from backend
  varieties?: Variety[];
  active?: boolean;
  hasVarieties?: boolean; // Computed flag
}

export interface PaginatedResponse<T> {
  itemList: T[];
  page?: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

interface RestData<T> {
  itemList?: T[];
  item?: T;
  successCount?: number;
  errorCount?: number;
  errors?: any[];
  page?: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ProductSearchFilters {
  page?: number;
  size?: number;
  category?: string;
  search?: string;
  hasVarieties?: boolean;
  sort?: string;
  direction?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiBaseUrl}/products`;

  // Fallback mock data
  private products: Product[] = [
    // Cereals
    {
      id: 'maize',
      name: 'Maize',
      description: 'High-yield maize varieties with excellent nutritional value and drought resistance',
      imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
      categoryId: 'cereals-uuid-001',
      category: 'Cereals',
      varieties: [
        {
          cropName: 'Maize',
          varietyReleaseName: 'TARI-Maize-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Hybrid',
          productionAltitude: '800-1800 m',
          maintainer: 'TARI - Ilonga Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '6.5-8.0 MT/ha',
          specialAttributes: 'Drought tolerant, high protein content, early maturing',
          botanicalName: 'Zea mays L.',
          typeOfLicense: 'Open Source',
          color: 'Yellow',
          limitation: 'Requires moderate rainfall and good soil fertility for optimal yield',
          commonName: 'Corn',
          maturityDays: 90,
          yearOfRelease: '2020',
          distinctiveCharacters: 'Large kernels, yellow color, high yield potential',
          regionNames: ['Arusha', 'Kilimanjaro', 'Manyara', 'Tanga'],
          imageUrls: [],
          commercialisationLevel: 'Commercial',
          recommendedAgriculturalEcologicalZones: 'Eastern, Southern Highlands, Lake Zone'
        },
        {
          cropName: 'Maize',
          varietyReleaseName: 'TARI-Maize-002',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Open Pollinated',
          productionAltitude: '600-1500 m',
          maintainer: 'TARI - Ukiriguru Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '5.0-6.5 MT/ha',
          specialAttributes: 'Disease resistant, good storage quality, medium maturity',
          botanicalName: 'Zea mays L.',
          typeOfLicense: 'Open Source',
          color: 'White',
          limitation: 'Less tolerant to prolonged drought compared to hybrid varieties',
          commonName: 'Corn',
          maturityDays: 100,
          yearOfRelease: '2019',
          distinctiveCharacters: 'White kernels, good for flour production, disease resistant',
          regionNames: ['Mwanza', 'Shinyanga', 'Simiyu', 'Tabora'],
          imageUrls: [],
          commercialisationLevel: 'Commercial',
          recommendedAgriculturalEcologicalZones: 'Lake Zone, Western, Central'
        }
      ]
    },
    {
      id: 'finger-millet',
      name: 'Finger Millet',
      description: 'Nutritious finger millet varieties rich in calcium and iron',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=300&fit=crop',
      categoryId: 'cereals-uuid-001',
      category: 'Cereals',
      varieties: [
        {
          cropName: 'Finger Millet',
          varietyReleaseName: 'TARI-FingerMillet-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '900-2000 m',
          maintainer: 'TARI - Selian Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '2.5-3.5 MT/ha',
          specialAttributes: 'High calcium and iron content, drought tolerant, early maturing',
          botanicalName: 'Eleusine coracana',
          typeOfLicense: 'Open Source',
          color: 'Brown',
          limitation: 'Small grain size may require specialized processing equipment',
          commonName: 'Ragi',
          maturityDays: 110,
          yearOfRelease: '2021',
          distinctiveCharacters: 'Brown grains, high nutritional value, good for porridge',
          regionNames: ['Arusha', 'Kilimanjaro', 'Manyara'],
          imageUrls: []
        }
      ]
    },
    {
      id: 'rice',
      name: 'Rice',
      description: 'Premium rice varieties adapted for local growing conditions',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
      categoryId: 'cereals-uuid-001',
      category: 'Cereals',
      varieties: [
        {
          cropName: 'Rice',
          varietyReleaseName: 'TARI-Rice-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '0-1200 m',
          maintainer: 'TARI - Ifakara Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '4.5-6.0 MT/ha',
          specialAttributes: 'Salt tolerant, aromatic, high milling recovery',
          botanicalName: 'Oryza sativa L.',
          typeOfLicense: 'Open Source',
          color: 'White',
          limitation: 'Sensitive to water stress during flowering stage',
          commonName: 'Paddy Rice',
          maturityDays: 120,
          yearOfRelease: '2018',
          distinctiveCharacters: 'Long grain, aromatic, white polished rice',
          regionNames: ['Pwani', 'Morogoro', 'Lindi', 'Mtwara'],
          imageUrls: [],
          commercialisationLevel: 'Commercial',
          recommendedAgriculturalEcologicalZones: 'Coastal, Eastern, Morogoro'
        }
      ]
    },
    {
      id: 'wheat',
      name: 'Wheat',
      description: 'High-quality wheat varieties for bread and pasta production',
      imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
      categoryId: 'cereals-uuid-001',
      category: 'Cereals',
      varieties: [
        {
          cropName: 'Wheat',
          varietyReleaseName: 'TARI-Wheat-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '1500-2500 m',
          maintainer: 'TARI - Selian Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '3.5-5.0 MT/ha',
          specialAttributes: 'High protein content, good for bread making, disease resistant',
          botanicalName: 'Triticum aestivum L.',
          typeOfLicense: 'Open Source',
          color: 'Golden',
          limitation: 'Performs best in cooler high-altitude areas',
          commonName: 'Wheat',
          maturityDays: 130,
          yearOfRelease: '2019',
          distinctiveCharacters: 'Hard wheat, high gluten content, golden color',
          regionNames: ['Arusha', 'Kilimanjaro', 'Manyara'],
          imageUrls: []
        }
      ]
    },
    {
      id: 'sorghum',
      name: 'Sorghum',
      description: 'Drought-tolerant sorghum varieties for sustainable agriculture',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=300&fit=crop',
      categoryId: 'cereals-uuid-001',
      category: 'Cereals',
      varieties: [
        {
          cropName: 'Sorghum',
          varietyReleaseName: 'TARI-Sorghum-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '400-1500 m',
          maintainer: 'TARI - Ukiriguru Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '3.0-4.5 MT/ha',
          specialAttributes: 'Drought tolerant, bird resistant, good for brewing',
          botanicalName: 'Sorghum bicolor',
          typeOfLicense: 'Open Source',
          color: 'Red',
          limitation: 'Some varieties may have tannins affecting taste if not processed well',
          commonName: 'Sorghum',
          maturityDays: 100,
          yearOfRelease: '2020',
          distinctiveCharacters: 'Red grains, compact panicle, high yield',
          regionNames: ['Mwanza', 'Shinyanga', 'Tabora', 'Dodoma'],
          imageUrls: []
        }
      ]
    },
    // Seeds
    {
      id: 'oil-seeds',
      name: 'Oil Seeds',
      description: 'Premium oil seed varieties for high-quality oil production',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
      category: 'Seeds',
      varieties: [
        {
          cropName: 'Oil Seeds',
          varietyReleaseName: 'TARI-OilSeeds-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '500-1500 m',
          maintainer: 'TARI - Naliendele Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '1.5-2.5 MT/ha',
          specialAttributes: 'High oil content, disease resistant, good for processing',
          botanicalName: 'Various',
          typeOfLicense: 'Open Source',
          color: 'Mixed',
          limitation: 'Oil extraction may require modern processing facilities',
          commonName: 'Oil Seeds',
          maturityDays: 90,
          yearOfRelease: '2020',
          distinctiveCharacters: 'High oil yield, good quality',
          regionNames: ['Mtwara', 'Lindi', 'Pwani'],
          imageUrls: []
        }
      ]
    },
    {
      id: 'sunflower',
      name: 'Sunflower',
      description: 'Sunflower seeds with high oil content and nutritional benefits',
      imageUrl: 'https://images.unsplash.com/photo-1597848212624-e593b4b46a45?w=400&h=300&fit=crop',
      category: 'Seeds',
      varieties: [
        {
          cropName: 'Sunflower',
          varietyReleaseName: 'TARI-Sunflower-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Hybrid',
          productionAltitude: '400-1800 m',
          maintainer: 'TARI - Ilonga Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '2.0-3.5 MT/ha',
          specialAttributes: 'High oil content, drought tolerant, bird resistant',
          botanicalName: 'Helianthus annuus L.',
          typeOfLicense: 'Open Source',
          color: 'Yellow',
          limitation: 'Susceptible to lodging in very windy areas',
          commonName: 'Sunflower',
          maturityDays: 100,
          yearOfRelease: '2021',
          distinctiveCharacters: 'Large flower heads, high seed yield',
          regionNames: ['Dodoma', 'Singida', 'Tabora'],
          imageUrls: []
        }
      ]
    },
    {
      id: 'sesame',
      name: 'Sesame',
      description: 'Premium sesame seeds for culinary and oil production',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
      category: 'Seeds',
      varieties: [
        {
          cropName: 'Sesame',
          varietyReleaseName: 'TARI-Sesame-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '0-1200 m',
          maintainer: 'TARI - Naliendele Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '0.8-1.5 MT/ha',
          specialAttributes: 'High oil content, aromatic, drought tolerant',
          botanicalName: 'Sesamum indicum L.',
          typeOfLicense: 'Open Source',
          color: 'White',
          limitation: 'Seed shattering can occur if harvesting is delayed',
          commonName: 'Sesame',
          maturityDays: 90,
          yearOfRelease: '2019',
          distinctiveCharacters: 'White seeds, high oil content, good flavor',
          regionNames: ['Mtwara', 'Lindi', 'Pwani'],
          imageUrls: []
        }
      ]
    },
    // Legumes
    {
      id: 'beans',
      name: 'Beans',
      description: 'Nutritious bean varieties rich in protein and essential nutrients',
      imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c199229dab7?w=400&h=300&fit=crop',
      category: 'Legumes',
      varieties: [
        {
          cropName: 'Beans',
          varietyReleaseName: 'TARI-Beans-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '900-2000 m',
          maintainer: 'TARI - Selian Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '1.8-2.5 MT/ha',
          specialAttributes: 'High iron content, disease resistant, climbing type',
          botanicalName: 'Phaseolus vulgaris L.',
          typeOfLicense: 'Open Source',
          color: 'Red',
          limitation: 'Requires staking/support for optimal performance',
          commonName: 'Common Bean',
          maturityDays: 75,
          yearOfRelease: '2018',
          distinctiveCharacters: 'Red beans, climbing habit, high yield',
          regionNames: ['Arusha', 'Kilimanjaro', 'Manyara'],
          imageUrls: [],
          commercialisationLevel: 'Commercial',
          recommendedAgriculturalEcologicalZones: 'Northern, Southern Highlands, Arusha'
        },
        {
          cropName: 'Beans',
          varietyReleaseName: 'TARI-Beans-002',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Bush Variety',
          productionAltitude: '800-1800 m',
          maintainer: 'TARI - Uyole Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '1.5-2.0 MT/ha',
          specialAttributes: 'Early maturing, drought tolerant, high protein',
          botanicalName: 'Phaseolus vulgaris L.',
          typeOfLicense: 'Open Source',
          color: 'White',
          limitation: 'Shorter harvesting window; pods can shatter if left too long',
          commonName: 'Common Bean',
          maturityDays: 65,
          yearOfRelease: '2019',
          distinctiveCharacters: 'White beans, bush type, early maturing',
          regionNames: ['Mbeya', 'Iringa', 'Njombe'],
          imageUrls: [],
          commercialisationLevel: 'Commercial',
          recommendedAgriculturalEcologicalZones: 'Southern Highlands, Mbeya, Iringa'
        }
      ]
    },
    {
      id: 'peas',
      name: 'Peas',
      description: 'Fresh and dried pea varieties for diverse culinary uses',
      imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c199229dab7?w=400&h=300&fit=crop',
      category: 'Legumes',
      varieties: [
        {
          cropName: 'Peas',
          varietyReleaseName: 'TARI-Peas-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '1000-2200 m',
          maintainer: 'TARI - Selian Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '2.0-3.0 MT/ha',
          specialAttributes: 'High protein, fresh and dry consumption, disease resistant',
          botanicalName: 'Pisum sativum L.',
          typeOfLicense: 'Open Source',
          color: 'Green',
          limitation: 'Sensitive to high temperatures during flowering',
          commonName: 'Garden Pea',
          maturityDays: 70,
          yearOfRelease: '2020',
          distinctiveCharacters: 'Green pods, sweet taste, high yield',
          regionNames: ['Arusha', 'Kilimanjaro', 'Manyara'],
          imageUrls: []
        }
      ]
    },
    {
      id: 'groundnuts',
      name: 'Groundnuts',
      description: 'High-yield groundnut varieties with excellent flavor and nutrition',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
      category: 'Legumes',
      varieties: [
        {
          cropName: 'Groundnuts',
          varietyReleaseName: 'TARI-Groundnuts-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '500-1500 m',
          maintainer: 'TARI - Naliendele Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '2.5-3.5 MT/ha',
          specialAttributes: 'High oil content, good flavor, disease resistant',
          botanicalName: 'Arachis hypogaea L.',
          typeOfLicense: 'Open Source',
          color: 'Tan',
          limitation: 'Requires well-drained soils to avoid aflatoxin risk',
          commonName: 'Peanut',
          maturityDays: 110,
          yearOfRelease: '2019',
          distinctiveCharacters: 'Large pods, high oil content, good roasting quality',
          regionNames: ['Mtwara', 'Lindi', 'Pwani'],
          imageUrls: []
        }
      ]
    },
    // Vegetables
    {
      id: 'tomatoes',
      name: 'Tomatoes',
      description: 'Fresh tomato varieties for fresh consumption and processing',
      imageUrl: 'https://images.unsplash.com/photo-1546470427-e26264be0a40?w=400&h=300&fit=crop',
      categoryId: 'vegetables-uuid-002',
      category: 'Vegetables',
      varieties: [
        {
          cropName: 'Tomatoes',
          varietyReleaseName: 'TARI-Tomatoes-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Hybrid',
          productionAltitude: '0-1800 m',
          maintainer: 'TARI - Ilonga Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '25.0-35.0 MT/ha',
          specialAttributes: 'High yield, disease resistant, good for fresh market',
          botanicalName: 'Solanum lycopersicum L.',
          typeOfLicense: 'Open Source',
          color: 'Red',
          limitation: 'Highly sensitive to late blight in humid conditions',
          commonName: 'Tomato',
          maturityDays: 75,
          yearOfRelease: '2021',
          distinctiveCharacters: 'Round red fruits, firm texture, good shelf life',
          regionNames: ['Arusha', 'Kilimanjaro', 'Manyara', 'Morogoro'],
          imageUrls: []
        }
      ]
    },
    {
      id: 'onions',
      name: 'Onions',
      description: 'Premium onion varieties with excellent storage qualities',
      imageUrl: 'https://images.unsplash.com/photo-1618512496249-5a8a8c604672?w=400&h=300&fit=crop',
      categoryId: 'vegetables-uuid-002',
      category: 'Vegetables',
      varieties: [
        {
          cropName: 'Onions',
          varietyReleaseName: 'TARI-Onions-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '800-2000 m',
          maintainer: 'TARI - Selian Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '20.0-30.0 MT/ha',
          specialAttributes: 'Long storage life, pungent flavor, disease resistant',
          botanicalName: 'Allium cepa L.',
          typeOfLicense: 'Open Source',
          color: 'Golden brown',
          limitation: 'Bulb splitting can occur under irregular watering',
          commonName: 'Onion',
          maturityDays: 120,
          yearOfRelease: '2020',
          distinctiveCharacters: 'Large bulbs, golden brown skin, strong flavor',
          regionNames: ['Arusha', 'Kilimanjaro', 'Manyara'],
          imageUrls: []
        }
      ]
    },
    {
      id: 'potatoes',
      name: 'Potatoes',
      description: 'High-yield potato varieties for diverse culinary applications',
      imageUrl: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400&h=300&fit=crop',
      categoryId: 'vegetables-uuid-002',
      category: 'Vegetables',
      varieties: [
        {
          cropName: 'Potatoes',
          varietyReleaseName: 'TARI-Potatoes-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '1200-2800 m',
          maintainer: 'TARI - Uyole Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '15.0-25.0 MT/ha',
          specialAttributes: 'High yield, good cooking quality, disease resistant',
          botanicalName: 'Solanum tuberosum L.',
          typeOfLicense: 'Open Source',
          color: 'White flesh',
          limitation: 'Susceptible to late blight without proper management',
          commonName: 'Potato',
          maturityDays: 100,
          yearOfRelease: '2019',
          distinctiveCharacters: 'White flesh, smooth skin, good for chips and fries',
          regionNames: ['Mbeya', 'Iringa', 'Njombe', 'Rukwa'],
          imageUrls: []
        }
      ]
    },
    // Fruits
    {
      id: 'mangoes',
      name: 'Mangoes',
      description: 'Sweet and juicy mango varieties with excellent flavor',
      imageUrl: 'https://images.unsplash.com/photo-1605027990121-3c027f1e4f43?w=400&h=300&fit=crop',
      category: 'Fruits',
      varieties: [
        {
          cropName: 'Mangoes',
          varietyReleaseName: 'TARI-Mangoes-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '0-1200 m',
          maintainer: 'TARI - Mikocheni Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '15.0-25.0 MT/ha',
          specialAttributes: 'Sweet flavor, disease resistant, good shelf life',
          botanicalName: 'Mangifera indica L.',
          typeOfLicense: 'Open Source',
          color: 'Yellow-orange',
          limitation: 'Alternate bearing may occur without proper pruning',
          commonName: 'Mango',
          maturityDays: 120,
          yearOfRelease: '2020',
          distinctiveCharacters: 'Large fruits, yellow-orange color, sweet taste',
          regionNames: ['Pwani', 'Morogoro', 'Tanga'],
          imageUrls: []
        }
      ]
    },
    {
      id: 'bananas',
      name: 'Bananas',
      description: 'Premium banana varieties with high nutritional value',
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
      category: 'Fruits',
      varieties: [
        {
          cropName: 'Bananas',
          varietyReleaseName: 'TARI-Bananas-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '0-1800 m',
          maintainer: 'TARI - Mikocheni Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '20.0-35.0 MT/ha',
          specialAttributes: 'High yield, disease resistant, good taste',
          botanicalName: 'Musa acuminata',
          typeOfLicense: 'Open Source',
          color: 'Yellow',
          limitation: 'Sensitive to waterlogging and strong winds',
          commonName: 'Banana',
          maturityDays: 270,
          yearOfRelease: '2019',
          distinctiveCharacters: 'Large bunches, sweet taste, yellow when ripe',
          regionNames: ['Kagera', 'Mwanza', 'Mara', 'Kilimanjaro'],
          imageUrls: []
        }
      ]
    },
    {
      id: 'avocados',
      name: 'Avocados',
      description: 'Creamy avocado varieties rich in healthy fats and nutrients',
      imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop',
      category: 'Fruits',
      varieties: [
        {
          cropName: 'Avocados',
          varietyReleaseName: 'TARI-Avocados-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '800-2000 m',
          maintainer: 'TARI - Selian Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '12.0-20.0 MT/ha',
          specialAttributes: 'High oil content, creamy texture, good for export',
          botanicalName: 'Persea americana Mill.',
          typeOfLicense: 'Open Source',
          color: 'Green skin',
          limitation: 'Fruits bruise easily during rough handling',
          commonName: 'Avocado',
          maturityDays: 180,
          yearOfRelease: '2021',
          distinctiveCharacters: 'Large fruits, green skin, creamy flesh',
          regionNames: ['Arusha', 'Kilimanjaro', 'Manyara'],
          imageUrls: []
        }
      ]
    },
    // Others
    {
      id: 'coffee',
      name: 'Coffee',
      description: 'Premium coffee beans with rich flavor and aroma',
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      category: 'Others',
      varieties: [
        {
          cropName: 'Coffee',
          varietyReleaseName: 'TARI-Coffee-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '1200-2000 m',
          maintainer: 'TARI - Lyamungu Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '1.5-2.5 MT/ha',
          specialAttributes: 'High quality, aromatic, good for specialty coffee',
          botanicalName: 'Coffea arabica L.',
          typeOfLicense: 'Open Source',
          color: 'Green beans (raw)',
          limitation: 'Requires cool high-altitude conditions for best quality',
          commonName: 'Coffee',
          maturityDays: 1095,
          yearOfRelease: '2018',
          distinctiveCharacters: 'Arabica variety, high quality beans, rich flavor',
          regionNames: ['Kilimanjaro', 'Arusha', 'Mbeya'],
          imageUrls: []
        }
      ]
    },
    {
      id: 'tea',
      name: 'Tea',
      description: 'High-quality tea leaves for premium tea production',
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
      category: 'Others',
      varieties: [
        {
          cropName: 'Tea',
          varietyReleaseName: 'TARI-Tea-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '1500-2500 m',
          maintainer: 'TARI - Lyamungu Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '2.5-4.0 MT/ha',
          specialAttributes: 'High quality, good flavor, disease resistant',
          botanicalName: 'Camellia sinensis (L.) Kuntze',
          typeOfLicense: 'Open Source',
          color: 'Dark green leaves',
          limitation: 'Sensitive to prolonged drought and poor pruning',
          commonName: 'Tea',
          maturityDays: 1095,
          yearOfRelease: '2019',
          distinctiveCharacters: 'Dark green leaves, high quality, good flavor',
          regionNames: ['Kilimanjaro', 'Arusha', 'Njombe'],
          imageUrls: []
        }
      ]
    },
    {
      id: 'spices',
      name: 'Spices',
      description: 'Aromatic spice varieties for enhanced culinary experiences',
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop',
      category: 'Others',
      varieties: [
        {
          cropName: 'Spices',
          varietyReleaseName: 'TARI-Spices-001',
          releaseEntityOwner: 'Tanzania Agricultural Research Institute',
          varietyType: 'Improved Variety',
          productionAltitude: '0-1500 m',
          maintainer: 'TARI - Mikocheni Research Centre',
          maintenanceStatus: 'Commercial',
          potentialYield: '1.0-2.0 MT/ha',
          specialAttributes: 'Aromatic, high quality, good for export',
          botanicalName: 'Various',
          typeOfLicense: 'Open Source',
          color: 'Mixed',
          limitation: 'Quality can decline quickly without proper drying and storage',
          commonName: 'Spices',
          maturityDays: 120,
          yearOfRelease: '2020',
          distinctiveCharacters: 'Aromatic, high quality, diverse varieties',
          regionNames: ['Zanzibar', 'Pwani', 'Tanga'],
          imageUrls: []
        }
      ]
    }
  ];

  constructor(private http: HttpClient) { }

  /**
   * Get paginated products with enhanced filtering
   */
  getProductsPaged(filters?: ProductSearchFilters): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();
    if (filters?.page !== undefined) {
      params = params.set('page', filters.page.toString());
    }
    if (filters?.size !== undefined) {
      params = params.set('size', filters.size.toString());
    }
    if (filters?.category) {
      params = params.set('category', filters.category);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.hasVarieties !== undefined) {
      params = params.set('hasVarieties', filters.hasVarieties.toString());
    }
    if (filters?.sort) {
      params = params.set('sort', filters.sort);
    }
    if (filters?.direction) {
      params = params.set('direction', filters.direction);
    }

    return this.http.get<RestData<Product>>(`${this.apiUrl}/paged`, { params }).pipe(
      map(response => ({
        itemList: (response.itemList || []).map(p => this.mapProductResponse(p)),
        page: response.page
      })),
      catchError(error => {
        console.warn('Failed to fetch paginated products from API:', error);
        return of({ itemList: [], page: undefined });
      })
    );
  }

  getAllProducts(categoryUid?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (categoryUid) {
      params = params.set('category', categoryUid);
    }
    params = params.set('active', 'true');

    return this.http.get<RestData<Product>>(this.apiUrl, { params }).pipe(
      map(response => {
        if (response.itemList && response.itemList.length > 0) {
          return response.itemList.map(p => this.mapProductResponse(p));
        }
        // Fallback to mock data if API returns empty
        return categoryUid
          ? this.products.filter(p => p.categoryId === categoryUid)
          : this.products;
      }),
      catchError(error => {
        console.warn('Failed to fetch products from API, using mock data:', error);
        // Return mock data on error
        return of(categoryUid
          ? this.products.filter(p => p.categoryId === categoryUid)
          : this.products);
      })
    );
  }

  getProductsByCategory(categoryUid: string): Observable<Product[]> {
    return this.getAllProducts(categoryUid);
  }

  getProductById(id: string): Observable<Product | undefined> {
    return this.http.get<RestData<Product>>(`${this.apiUrl}/${id}`).pipe(
      switchMap(response => {
        if (response.item) {
          const product = this.mapProductResponse(response.item);
          // Fetch varieties for this product
          return this.getProductVarieties(id).pipe(
            map(varieties => {
              product.varieties = varieties.length > 0 ? varieties : product.varieties;
              return product;
            }),
            catchError(() => {
              // If variety fetch fails, use varieties from product if available
              return of(product);
            })
          );
        }
        // Fallback to mock data
        const mockProduct = this.products.find(p => p.id === id);
        return of(mockProduct);
      }),
      catchError(error => {
        console.warn('Failed to fetch product from API, using mock data:', error);
        // Return mock product on error
        return of(this.products.find(p => p.id === id));
      })
    );
  }

  getProductVarieties(productUid: string): Observable<Variety[]> {
    return this.http.get<RestData<Variety>>(`${this.apiUrl}/${productUid}/varieties`).pipe(
      map(response => {
        if (response.itemList && response.itemList.length > 0) {
          return response.itemList.map(v => this.mapVarietyResponse(v));
        }
        return [];
      }),
      catchError(error => {
        console.warn('Failed to fetch varieties from API, using mock data:', error);
        // Try to get varieties from mock product data
        const mockProduct = this.products.find(p => p.id === productUid);
        return of(mockProduct?.varieties || []);
      })
    );
  }

  private mapVarietyResponse(apiVariety: any): Variety {
    const variety: Variety = {
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

    return variety;
  }

  private mapProductResponse(apiProduct: any): Product {
    return {
      id: apiProduct.uid || apiProduct.id,
      name: apiProduct.name,
      description: apiProduct.description,
      imageUrl: apiProduct.imageUrl || (apiProduct.imageObjectName
        ? `${this.apiUrl}/${apiProduct.uid}/image`
        : undefined),
      categoryId: apiProduct.categoryId,
      category: apiProduct.categoryName || apiProduct.category,
      varieties: apiProduct.varieties || []
    };
  }
}
