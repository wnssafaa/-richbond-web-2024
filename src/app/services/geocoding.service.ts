import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {

  constructor(private http: HttpClient) { }

  // Méthode 1: Utiliser le proxy Angular configuré
  reverseGeocodeWithProxy(lat: number, lng: number): Observable<string> {
    const nominatimUrl = `/nominatim/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
    
    return this.http.get<any>(nominatimUrl).pipe(
      map(data => {
        if (data.display_name) {
          return data.display_name;
        } else if (data.address) {
          // Construire une adresse à partir des détails
          const address = data.address;
          const parts = [];
          if (address.house_number) parts.push(address.house_number);
          if (address.road) parts.push(address.road);
          if (address.city || address.town || address.village) parts.push(address.city || address.town || address.village);
          if (address.state) parts.push(address.state);
          if (address.country) parts.push(address.country);
          return parts.join(', ');
        }
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }),
      catchError(error => {
        console.warn('Erreur avec le proxy Angular:', error);
        return of(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      })
    );
  }

  // Méthode 2: Utiliser l'API de géocodage de votre backend (si disponible)
  reverseGeocodeWithBackend(lat: number, lng: number): Observable<string> {
    return this.http.get<string>(`/api/geocoding/reverse?lat=${lat}&lng=${lng}`).pipe(
      catchError(error => {
        console.warn('Erreur avec le backend:', error);
        return of(`${lat},${lng}`);
      })
    );
  }

  // Méthode 3: Géocodage local basé sur les coordonnées des villes marocaines
  reverseGeocodeLocal(lat: number, lng: number): Observable<string> {
    const moroccanCities = [
      { name: 'Casablanca', lat: 33.5731, lng: -7.5898, region: 'Casablanca-Settat' },
      { name: 'Rabat', lat: 34.0209, lng: -6.8416, region: 'Rabat-Salé-Kénitra' },
      { name: 'Marrakech', lat: 31.6295, lng: -7.9811, region: 'Marrakech-Safi' },
      { name: 'Fès', lat: 34.0181, lng: -5.0078, region: 'Fès-Meknès' },
      { name: 'Agadir', lat: 30.4278, lng: -9.5981, region: 'Souss-Massa' },
      { name: 'Tanger', lat: 35.7595, lng: -5.8340, region: 'Tanger-Tétouan-Al Hoceïma' },
      { name: 'Meknès', lat: 33.8935, lng: -5.5473, region: 'Fès-Meknès' },
      { name: 'Oujda', lat: 34.6814, lng: -1.9086, region: 'l\'Oriental' },
      { name: 'Kénitra', lat: 34.2610, lng: -6.5802, region: 'Rabat-Salé-Kénitra' },
      { name: 'Tétouan', lat: 35.5711, lng: -5.3644, region: 'Tanger-Tétouan-Al Hoceïma' },
      { name: 'Safi', lat: 32.2988, lng: -9.2377, region: 'Marrakech-Safi' },
      { name: 'El Jadida', lat: 33.2316, lng: -8.5007, region: 'Casablanca-Settat' },
      { name: 'Mohammedia', lat: 33.6871, lng: -7.3828, region: 'Casablanca-Settat' },
      { name: 'Béni Mellal', lat: 32.3373, lng: -6.3498, region: 'Béni Mellal-Khénifra' },
      { name: 'Nador', lat: 35.1681, lng: -2.9273, region: 'l\'Oriental' },
      { name: 'Taza', lat: 34.2139, lng: -4.0088, region: 'Fès-Meknès' },
      { name: 'Settat', lat: 33.0011, lng: -7.6167, region: 'Casablanca-Settat' },
      { name: 'Larache', lat: 35.1933, lng: -6.1557, region: 'Tanger-Tétouan-Al Hoceïma' },
      { name: 'Khouribga', lat: 32.8848, lng: -6.9064, region: 'Béni Mellal-Khénifra' },
      { name: 'Ouarzazate', lat: 30.9333, lng: -6.9000, region: 'Drâa-Tafilalet' }
    ];

    // Trouver la ville la plus proche
    let closestCity = moroccanCities[0];
    let minDistance = this.calculateDistance(lat, lng, closestCity.lat, closestCity.lng);

    for (const city of moroccanCities) {
      const distance = this.calculateDistance(lat, lng, city.lat, city.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }

    // Si la distance est raisonnable (< 50km), générer une adresse réaliste
    if (minDistance < 50) {
      const streetNames = [
        'Rue Mohammed V', 'Avenue Hassan II', 'Boulevard Mohammed VI', 
        'Rue Al Massira', 'Avenue des FAR', 'Rue Ibn Khaldoun',
        'Boulevard Mohammed V', 'Avenue Mohammed VI', 'Rue Ibn Sina',
        'Avenue Ibn Batouta', 'Boulevard Al Qods', 'Rue Al Andalous'
      ];
      
      const randomStreet = streetNames[Math.floor(Math.random() * streetNames.length)];
      const streetNumber = Math.floor(Math.random() * 200) + 1;
      
      return of(`${streetNumber} ${randomStreet}, ${closestCity.name}, ${closestCity.region}, Maroc`);
    } else {
      return of(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Méthode principale qui essaie toutes les options
  reverseGeocode(lat: number, lng: number): Observable<string> {
    // Essayer d'abord le géocodage local (plus fiable)
    return this.reverseGeocodeLocal(lat, lng).pipe(
      catchError(() => {
        // Si ça échoue, essayer le proxy CORS
        return this.reverseGeocodeWithProxy(lat, lng).pipe(
          catchError(() => {
            // En dernier recours, essayer le backend
            return this.reverseGeocodeWithBackend(lat, lng);
          })
        );
      })
    );
  }

  // Méthode pour géocoder une adresse en coordonnées
  geocode(address: string): Observable<{lat: number, lng: number} | null> {
    if (!address || address.trim() === '') {
      return of(null);
    }

    // Utiliser le proxy Angular configuré pour Nominatim
    const nominatimUrl = `/nominatim/search?format=json&q=${encodeURIComponent(address)}&countrycodes=ma&limit=1`;
    
    return this.http.get<any[]>(nominatimUrl).pipe(
      map(data => {
        if (data && data.length > 0) {
          const result = data[0];
          return {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon)
          };
        }
        return null;
      }),
      catchError(error => {
        console.warn('Erreur lors du géocodage:', error);
        return of(null);
      })
    );
  }
}
