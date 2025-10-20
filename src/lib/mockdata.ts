import ecommerceImg from '$lib/images/ecommerce.png';
import worklifeImg from '$lib/images/work-life.jpg';
import assetImg from '$lib/images/asset.jpg';
import meetingRoomImg from '$lib/images/meeting-room.jpg';
import type { CardstackEntry } from '$types';

export const cardstackEntries: CardstackEntry[] = [
	{
		eyebrow: 'E-commerce',
		title: 'Scaling a fashion retailer to handle Black Friday traffic',
		description:
			'We helped a Nordic fashion brand modernise their storefront and backend to survive peak shopping days without downtime.',
		bullets: [
			'Migrated to a headless SvelteKit storefront with lightning-fast load times',
			'Implemented autoscaling infrastructure on AWS',
			'Increased conversion rates by 18% during seasonal campaigns'
		],
		img: ecommerceImg,
		imgAlt: 'E-commerce case image'
	},
	{
		eyebrow: 'Healthcare',
		title: 'Bringing telemedicine to thousands of patients',
		description:
			'A Swedish health startup partnered with us to design and build a secure platform for video consultations and patient journals.',
		bullets: [
			'BankID login and GDPR-compliant data handling',
			'Accessible, mobile-first design tested with real patients',
			'Integration with national e-prescription APIs'
		],
		img: worklifeImg,
		imgAlt: 'Healthcare case image'
	},
	{
		eyebrow: 'Mobility',
		title: 'Smart booking for electric car fleets',
		description:
			'We developed a real-time booking system for a city EV fleet, optimising charging schedules and vehicle availability.',
		bullets: [
			'Interactive map of charging stations with live availability',
			'Conflict-free scheduling with repeat bookings',
			'Analytics dashboard that reduced idle time by 23%'
		],
		img: assetImg,
		imgAlt: 'Mobility case image'
	},
	{
		eyebrow: 'Fitness',
		title: 'Next-gen gym member experience',
		description:
			'For a chain of boutique gyms, we created a unified platform for booking classes, tracking progress, and engaging members.',
		bullets: [
			'Personalised dashboards for members and trainers',
			'Seamless Stripe integration for recurring payments',
			'Gamified challenges that boosted retention'
		],
		img: meetingRoomImg,
		imgAlt: 'Fitness case image'
	}
];
