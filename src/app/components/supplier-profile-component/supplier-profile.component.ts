import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { Category, Review, SendReview } from 'src/app/Models/Models';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/Services/ApiService';
import { AuthService } from 'src/app/Services/AuthService';
import { UserRole } from 'src/app/Utilities/enums/Enums';
import { GalleryModule, ImageItem, GalleryItem, GalleryComponent } from 'ng-gallery';

@Component({
    selector: 'app-supplier-profile',
    templateUrl: './supplier-profile.component.html',
    styleUrls: ['./supplier-profile.component.css'],
    changeDetection: ChangeDetectionStrategy.Default
  })

  export class SupplierProfileComponent implements OnInit  {
    @Input() changesProfileId: number | undefined;
    @ViewChild('myGallery') gallery!: GalleryComponent;

    profileId: string = '';
    profileSlug: string ='';
    isMobile: Observable<boolean>;
    phoneNumber?: string;
    email?: string;
    websiteUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
    reviews?: Review[];
    numberProfileId!: number;
    currentUserId?: number;
    currentUserRole?: UserRole;
    isCurrentProfileLogged: boolean = false;
    customerUserLoggedId: boolean = false;
    userLoggedIn: boolean = false;
    reviewSent: boolean = false;
    areasOfInterest: string[] = [];
    urlProfileName: string = '';

    images!: GalleryItem[];


    imageObject: any = [];
    
    //model
    profileImage?: string;
    profileName?:string;
    categoryName?: string;
    motto?: string;
    city?: string;
    location?: string;
    description?: string;

    //rating part
    selectedRating: number = 0;
    reviewText: string = '';
    offerRating: boolean = false;


    constructor(private ref: ChangeDetectorRef, 
      private breakpointObserver: BreakpointObserver, 
      private route: ActivatedRoute, 
      private router: Router, 
      private apiService: ApiService, 
      private authService: AuthService){
      this.isMobile = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches)
      );
    }
    
    ngOnInit(): void {
      this.route.params.subscribe(params => {
        const profileInfo = params['profileId'];
        const lastDashIndex = profileInfo.lastIndexOf('-');
        this.urlProfileName = profileInfo.substring(0, lastDashIndex).replace(/-/g, ' ');
        this.profileId = profileInfo.substring(lastDashIndex + 1);
      });
      
      if (this.authService.isUserLogged()){
        this.userLoggedIn = true;
        var user = this.authService.getLoggedUser();
        this.currentUserRole = user.role;
        this.currentUserId = user.id;
        if (this.profileId != undefined && user.profilesIds?.includes(Number(this.profileId))){
          this.isCurrentProfileLogged = true;
        }
      }

      if (isNaN(Number(this.profileId)) && this.changesProfileId == undefined) {
        this.router.navigate(['/furnizori']);
      } else {
        if (this.changesProfileId != undefined){
          this.apiService.getProfileToReview(this.changesProfileId).subscribe(response => {
            this.profileName = response.businessName;
            this.profileImage = response.images.filter(x => x.isProfileImage == true).map(x => x.imageUrl)[0];
            this.motto = response.motto;
            this.location = response.cityName;
            this.categoryName = response.categoryName;
            this.phoneNumber = response.phoneNumber;
            this.email = response.email;
            this.description = response.description;
            this.websiteUrl = response.websiteUrl ? this.addHttpPrefix(response.websiteUrl) : undefined;
            this.facebookUrl = response.facebookUrl ? this.addHttpPrefix(response.facebookUrl) : undefined;
            this.instagramUrl = response.instagramUrl ? this.addHttpPrefix(response.instagramUrl) : undefined;
            this.youtubeUrl = response.youtubeUrl ? this.addHttpPrefix(response.youtubeUrl) : undefined;
            this.areasOfInterest = response.areaOfInterestNames;
            this.images = response.images.map(x => new ImageItem({ src: x.imageUrl, thumb: x.imageUrl }));

          })
        }
        else{
          this.apiService.getUserProfile(Number(this.profileId)).subscribe(response => {

            this.profileName = response.businessName;
            this.profileImage = response.images.filter(x => x.isProfileImage == true).map(x => x.imageUrl)[0];
            this.motto = response.motto;
            this.location = response.cityName;
            this.categoryName = response.categoryName;
            this.phoneNumber = response.phoneNumber;
            this.email = response.email;
            this.description = response.description;
            this.websiteUrl = response.websiteUrl ? this.addHttpPrefix(response.websiteUrl) : undefined;
            this.facebookUrl = response.facebookUrl ? this.addHttpPrefix(response.facebookUrl) : undefined;
            this.instagramUrl = response.instagramUrl ? this.addHttpPrefix(response.instagramUrl) : undefined;
            this.youtubeUrl = response.youtubeUrl ? this.addHttpPrefix(response.youtubeUrl) : undefined;
            this.numberProfileId = Number(this.profileId);
            this.reviews = response.reviews;
            this.areasOfInterest = response.areaOfInterestNames;
            this.images = response.images.map(x => new ImageItem({ src: x.imageUrl, thumb: x.imageUrl }));
          })
        }
      }

      

    }

    setRating(rating: number): void {
      this.selectedRating = rating;
    }
  
    submitReview(): void {
      var review = {
        score: this.selectedRating,
        reviewText: this.reviewText,
        userId: this.currentUserId,
        profileId: Number(this.numberProfileId)
      } as SendReview

      this.apiService.saveReview(review).subscribe({
        next: () => {
          this.reviewSent = true;
        },
        error: (error) => {
          console.error('Error saving review:', error);
          // Handle error
        }
      });

      
      // Add your logic to submit the review to the server or perform any other actions
    }

    isReviewIncomplete(){
      if (this.reviewText == '' || this.selectedRating == 0){
        return true;
      }
      return false;
    }

    showRatingInput(){
      this.offerRating = true;
    }

    addHttpPrefix(url: string): string {
      // Check if the URL has a valid protocol (http:// or https://)
      const hasValidProtocol = /^https?:\/\//i.test(url);
    
      // If not, add the http:// prefix
      if (!hasValidProtocol) {
        return `http://${url}`;
      }
    
      // If already has a valid protocol, return the original URL
      return url;
    }

    
  }