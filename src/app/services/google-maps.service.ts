import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  private apiLoaded = false;
  private apiLoadedSubject = new Subject<boolean>();

  constructor() {}

  loadGoogleMapsAPI(apiKey: string): Observable<boolean> {
    if (this.apiLoaded) {
      return new Observable((observer: any) => {
        observer.next(true);
        observer.complete();
      });
    }

    // Vérifier si l'API est déjà chargée
    if (typeof google !== 'undefined' && google.maps) {
      this.apiLoaded = true;
      this.apiLoadedSubject.next(true);
      return new Observable((observer: any) => {
        observer.next(true);
        observer.complete();
      });
    }

    // Vérifier si la clé API est valide
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      console.warn('Clé API Google Maps invalide ou manquante. Utilisez OpenStreetMap ou configurez une vraie clé API.');
      this.apiLoadedSubject.next(false);
      return this.apiLoadedSubject.asObservable();
    }

    // Charger l'API Google Maps avec chargement optimisé
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      this.apiLoaded = true;
      this.apiLoadedSubject.next(true);
    };

    script.onerror = () => {
      console.error('Erreur lors du chargement de l\'API Google Maps');
      this.apiLoadedSubject.next(false);
    };

    document.head.appendChild(script);

    return this.apiLoadedSubject.asObservable();
  }

  isApiLoaded(): boolean {
    return this.apiLoaded && typeof google !== 'undefined' && google.maps;
  }

  // Méthode pour géocoder une adresse
  geocodeAddress(address: string): Observable<{lat: number, lng: number} | null> {
    return new Observable((observer: any) => {
      if (!this.isApiLoaded()) {
        observer.error('Google Maps API not loaded');
        return;
      }

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          observer.next({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });
  }

  // Méthode pour reverse geocoder (coordonnées vers adresse)
  reverseGeocode(lat: number, lng: number): Observable<string | null> {
    return new Observable((observer: any) => {
      if (!this.isApiLoaded()) {
        observer.error('Google Maps API not loaded');
        return;
      }

      const geocoder = new google.maps.Geocoder();
      const latlng = { lat: lat, lng: lng };
      
      geocoder.geocode({ location: latlng }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          observer.next(results[0].formatted_address);
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });
  }

  // Méthode pour obtenir la position actuelle avec précision maximale
  getCurrentPosition(): Observable<{lat: number, lng: number, accuracy?: number} | null> {
    return new Observable((observer: any) => {
      if (!navigator.geolocation) {
        observer.error('Geolocation not supported');
        return;
      }

      // Options pour une précision maximale
      const options = {
        enableHighAccuracy: true,  // Utiliser le GPS si disponible
        timeout: 30000,           // Attendre plus longtemps pour une meilleure précision
        maximumAge: 0             // Toujours obtenir une nouvelle position
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          observer.next({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          observer.complete();
        },
        (error) => {
          observer.error(error);
        },
        options
      );
    });
  }
}
