
import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Group =
  | 'All'
  | 'Cash Crops'
  | 'Cereals'
  | 'Legumes'
  | 'Roots & Tubers'
  | 'Oil Crops';

type RequestKind = 'Pre-Book' | 'Pre-Order';

interface Crop {
  id: number;
  name: string;
  group: Group;
  count: number;
  image: string;
}

interface Variety {
  id: number;
  name: string;
  crop: string;
  image: string;
  yield: string;
  maturity: string;
  tolerance: string;
  center: string;
  regions: string;
  featured?: boolean;
  popularity?: number;
  rating?: number;
  reviews?: number;
}

interface Center {
  name: string;
  city: string;
  image: string;
}

interface Update {
  title: string;
  date: string;
  image: string;
}

@Component({
  selector: 'app-home',
  // standalone: true,
  // imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  // Demonstration images; replace with official crop photographs.
  readonly photos = {
    cashew: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=900&auto=format&fit=crop&q=85',
    maize: 'https://images.unsplash.com/photo-1601593768795-0a9d9d3f4b9c?w=900&auto=format&fit=crop&q=85',
    rice: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=900&auto=format&fit=crop&q=85',
    cassava: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=900&auto=format&fit=crop&q=85',
    beans: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=900&auto=format&fit=crop&q=85',
    groundnut: 'https://images.unsplash.com/photo-1567892320421-1c657571ea4a?w=900&auto=format&fit=crop&q=85',
    sorghum: 'https://images.unsplash.com/photo-1501436513145-30f24e19fcc4?w=900&auto=format&fit=crop&q=85',
    pea: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=900&auto=format&fit=crop&q=85',
    sweetpotato: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=900&auto=format&fit=crop&q=85',
    sunflower: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=900&auto=format&fit=crop&q=85',
    farm: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&auto=format&fit=crop&q=90',
    seedling: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1300&auto=format&fit=crop&q=90',
    center: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=85'
  };

  readonly crops: Crop[] = [
    { id: 1, name: 'Cashew', group: 'Cash Crops', count: 15, image: this.photos.cashew },
    { id: 2, name: 'Maize', group: 'Cereals', count: 28, image: this.photos.maize },
    { id: 3, name: 'Rice', group: 'Cereals', count: 22, image: this.photos.rice },
    { id: 4, name: 'Cassava', group: 'Roots & Tubers', count: 18, image: this.photos.cassava },
    { id: 5, name: 'Beans', group: 'Legumes', count: 20, image: this.photos.beans },
    { id: 6, name: 'Groundnut', group: 'Legumes', count: 16, image: this.photos.groundnut },
    { id: 7, name: 'Sorghum', group: 'Cereals', count: 12, image: this.photos.sorghum },
    { id: 8, name: 'Pigeon Pea', group: 'Legumes', count: 10, image: this.photos.pea },
    { id: 9, name: 'Sweet Potato', group: 'Roots & Tubers', count: 14, image: this.photos.sweetpotato },
    { id: 10, name: 'Sunflower', group: 'Oil Crops', count: 8, image: this.photos.sunflower }
  ];

  readonly varieties: Variety[] = [
    {
      id: 1,
      name: 'TARI AC 4',
      crop: 'Cashew',
      image: this.photos.cashew,
      yield: '1,500 – 2,000 kg/ha',
      maturity: '3 – 4 years',
      tolerance: 'High',
      center: 'TARI Naliendele',
      regions: 'Coastal, Eastern, Southern, Lake Zone',
      featured: true,
      popularity: 280,
      rating: 4.7,
      reviews: 280
    },
    {
      id: 2,
      name: 'TARI HS11',
      crop: 'Maize',
      image: this.photos.maize,
      yield: '5 – 7 t/ha',
      maturity: '90 – 100 days',
      tolerance: 'Moderate',
      center: 'TARI Ilonga',
      regions: 'Central and Eastern',
      featured: true,
      popularity: 320,
      rating: 4.8,
      reviews: 320
    },
    {
      id: 3,
      name: 'TARI TXD 306 (SARO 5)',
      crop: 'Rice',
      image: this.photos.rice,
      yield: '4 – 6 t/ha',
      maturity: '120 days',
      tolerance: 'Moderate',
      center: 'TARI Dakawa',
      regions: 'Irrigated areas',
      featured: true,
      popularity: 210,
      rating: 4.6,
      reviews: 210
    },
    {
      id: 4,
      name: 'TARI Selian 14',
      crop: 'Beans',
      image: this.photos.beans,
      yield: '1.5 – 2.5 t/ha',
      maturity: '75 – 85 days',
      tolerance: 'Moderate',
      center: 'TARI Selian',
      regions: 'Northern Highlands',
      featured: true,
      popularity: 190,
      rating: 4.5,
      reviews: 190
    },
    {
      id: 5,
      name: 'TARI Kibaha',
      crop: 'Cassava',
      image: this.photos.cassava,
      yield: 'Varies',
      maturity: '9 – 12 months',
      tolerance: 'High',
      center: 'TARI Kibaha',
      regions: 'Coastal',
      popularity: 160,
      rating: 4.5,
      reviews: 160
    },
    {
      id: 6,
      name: 'TARI Naliendele',
      crop: 'Groundnut',
      image: this.photos.groundnut,
      yield: 'Varies',
      maturity: '100 – 120 days',
      tolerance: 'Moderate',
      center: 'TARI Naliendele',
      regions: 'Southern',
      popularity: 140,
      rating: 4.4,
      reviews: 140
    }
  ];

  readonly centers: Center[] = [
    { name: 'TARI Naliendele', city: 'Mtwara', image: this.photos.center },
    { name: 'TARI Selian', city: 'Arusha', image: this.photos.farm },
    { name: 'TARI Ukiriguru', city: 'Mwanza', image: this.photos.center },
    { name: 'TARI Mlingano', city: 'Tanga', image: this.photos.farm },
    { name: 'TARI Kibaha', city: 'Pwani', image: this.photos.center }
  ];

  readonly updates: Update[] = [
    { title: 'New Maize Variety Released by TARI', date: '15 Oct 2026', image: this.photos.maize },
    { title: 'TARI Participates in Agricultural Exhibition', date: '10 Oct 2026', image: this.photos.farm },
    { title: 'New Research Findings on Cashew Production', date: '05 Oct 2026', image: this.photos.cashew }
  ];

  readonly groups: Group[] = [
    'All', 'Cash Crops', 'Cereals', 'Legumes',
    'Roots & Tubers', 'Oil Crops'
  ];

  readonly periods = [
    'All', 'Under 90 days', '90 – 120 days',
    'Over 120 days', '3 – 4 years'
  ];

  readonly tolerances = ['All', 'High', 'Moderate'];

  readonly researchCenters = [
    'All',
    ...this.centers.map(c => c.name),
    'TARI Ilonga',
    'TARI Dakawa'
  ];

  search = '';
  selectedCrop = 'All';
  selectedRegion = 'All';
  selectedPeriod = 'All';
  selectedTolerance = 'All';
  selectedCenter = 'All';
  selectedGroup: Group = 'All';

  cropOffset = 0;
  activeVariety = this.varieties[0];

  detailsTab:
    'Overview' | 'Characteristics' | 'Cultivation' |
    'Suitability' | 'Availability' = 'Overview';

  mobileMenuOpen = false;
  modalOpen = false;

  requestKind: RequestKind = 'Pre-Book';
  requestVariety: Variety | null = null;
  requesterName = '';
  requesterContact = '';
  requestQuantity = 1;
  requestFeedback = '';

  newsletterEmail = '';
  newsletterMessage = '';

  get displayedCrops(): Crop[] {
    return [
      ...this.crops.slice(this.cropOffset),
      ...this.crops.slice(0, this.cropOffset)
    ];
  }

  get filteredCrops(): Crop[] {
    const query = this.search.trim().toLowerCase();

    return this.crops.filter(c =>
      (this.selectedCrop === 'All' ||
       c.name === this.selectedCrop) &&
      (this.selectedGroup === 'All' ||
       c.group === this.selectedGroup) &&
      (!query ||
       c.name.toLowerCase().includes(query) ||
       c.group.toLowerCase().includes(query))
    );
  }

  get filteredVarieties(): Variety[] {
    const query = this.search.trim().toLowerCase();

    return this.varieties.filter(v =>
      (this.selectedCrop === 'All' ||
       v.crop === this.selectedCrop) &&
      (this.selectedCenter === 'All' ||
       v.center === this.selectedCenter) &&
      (this.selectedTolerance === 'All' ||
       v.tolerance === this.selectedTolerance) &&
      (this.selectedRegion === 'All' ||
       v.regions.toLowerCase().includes(
         this.selectedRegion.toLowerCase()
       )) &&
      (this.selectedPeriod === 'All' ||
       this.matchesPeriod(v.maturity, this.selectedPeriod)) &&
      (!query ||
       `${v.name} ${v.crop} ${v.center} ${v.regions}`
         .toLowerCase().includes(query))
    );
  }

  get featured(): Variety[] {
    return this.varieties.filter(v => v.featured);
  }

  get popular(): Variety[] {
    return [...this.varieties].sort(
      (a, b) => (b.popularity || 0) - (a.popularity || 0)
    );
  }

  private matchesPeriod(maturity: string, period: string): boolean {
    if (period === '3 – 4 years') {
      return maturity.includes('years');
    }

    const days = maturity.match(/\d+/g)?.map(Number) ?? [];

    if (!maturity.includes('day') || !days.length) {
      return false;
    }

    const min = Math.min(...days);
    const max = Math.max(...days);

    if (period === 'Under 90 days') return max < 90;
    if (period === '90 – 120 days') return min <= 120 && max >= 90;
    if (period === 'Over 120 days') return min > 120;

    return true;
  }

  slideCrops(direction: number): void {
    this.cropOffset = (
      this.cropOffset + direction + this.crops.length
    ) % this.crops.length;
  }

  showVariety(v: Variety): void {
    this.activeVariety = v;
    this.detailsTab = 'Overview';
    this.scrollTo('featured');
  }

  chooseCrop(crop: Crop): void {
    this.selectedCrop = crop.name;
    this.selectedGroup = 'All';
    this.scrollTo('catalogue');
  }

  searchCatalogue(): void {
    this.scrollTo('catalogue');
  }

  resetFilters(): void {
    this.search = '';
    this.selectedCrop = 'All';
    this.selectedRegion = 'All';
    this.selectedPeriod = 'All';
    this.selectedTolerance = 'All';
    this.selectedCenter = 'All';
    this.selectedGroup = 'All';
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    this.mobileMenuOpen = false;
  }

  openRequest(v: Variety, kind: RequestKind): void {
    this.requestVariety = v;
    this.requestKind = kind;
    this.requestFeedback = '';
    this.modalOpen = true;
  }

  closeRequest(): void {
    this.modalOpen = false;
    this.requestVariety = null;
    this.requestFeedback = '';
  }

  submitRequest(): void {
    if (
      !this.requesterName.trim() ||
      !this.requesterContact.trim() ||
      this.requestQuantity < 1
    ) {
      return;
    }

    this.requestFeedback =
      'Preview only — no request has been sent. ' +
      'Connect your ordering API to enable this feature.';
  }

  subscribe(): void {
    this.newsletterMessage = this.newsletterEmail.includes('@')
      ? 'Preview only — subscription is not connected yet.'
      : 'Please enter a valid email address.';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalOpen) this.closeRequest();
  }
}
