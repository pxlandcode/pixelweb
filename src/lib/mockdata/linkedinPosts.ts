import type { LinkedInPost } from '$lib/types';
import asset from '$lib/images/asset.jpg';
import workLife from '$lib/images/work-life.jpg';
import meetingRoom from '$lib/images/meeting-room.jpg';
import ecommerce from '$lib/images/ecommerce.png';
import karaoke from '$lib/images/scrollgallery/karaoke.jpg';
import shuffleboard from '$lib/images/scrollgallery/shuffleboard.JPG';
import workhard from '$lib/images/scrollgallery/workhard.jpg';

export const mockLinkedInPosts: LinkedInPost[] = [
	{
		id: 'mock-post-1',
		title: 'Exciting New Product Launch',
		summary:
			'We are thrilled to announce the launch of our latest digital solution that transforms how businesses manage their workflows. This innovative platform combines cutting-edge technology with user-friendly design.',
		publishedAt: new Date('2025-10-15').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: ecommerce,
		mediaAlt: 'Product launch celebration',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-2',
		title: 'Team Growth Announcement',
		summary:
			'Our team is expanding! We are excited to welcome five talented developers and designers who bring fresh perspectives and innovative ideas to our projects.',
		publishedAt: new Date('2025-10-08').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: meetingRoom,
		mediaAlt: 'Team collaboration meeting',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-3',
		title: 'Industry Recognition Award',
		summary:
			'Honored to receive the Digital Innovation Award for our groundbreaking work in web development and user experience design.',
		publishedAt: new Date('2025-09-28').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: asset,
		mediaAlt: 'Award ceremony',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-4',
		title: 'Tech Insights: Future of Web Development',
		summary:
			'Exploring the latest trends in web development, from AI integration to progressive web apps. Our team shares insights on what is shaping the future.',
		publishedAt: new Date('2025-09-20').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: workLife,
		mediaAlt: 'Technology and innovation concept',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-5',
		title: 'Team Building Success',
		summary:
			'Last week our team came together for an amazing team building event. From karaoke sessions to strategic planning, we strengthened our bonds.',
		publishedAt: new Date('2025-09-15').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: karaoke,
		mediaAlt: 'Team karaoke session',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-6',
		title: 'Office Fun Day Highlights',
		summary:
			'Taking a break from our projects to enjoy some friendly competition! Our shuffleboard tournament brought out everyone competitive spirit.',
		publishedAt: new Date('2025-09-10').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: shuffleboard,
		mediaAlt: 'Shuffleboard game',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-7',
		title: 'Dedication to Excellence',
		summary:
			'Behind every successful project is a team that works hard and smart. Here is a glimpse of our developers collaborating on innovative solutions.',
		publishedAt: new Date('2025-09-05').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: workhard,
		mediaAlt: 'Team working together',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-8',
		title: 'Client Success Story',
		summary:
			'Proud to share another successful project delivery! Our e-commerce platform helped our client increase their online sales by 150%.',
		publishedAt: new Date('2025-08-28').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: ecommerce,
		mediaAlt: 'E-commerce success',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-9',
		title: 'New Office Space Reveal',
		summary:
			'Excited to unveil our newly designed workspace! A modern environment that inspires creativity, collaboration, and innovation.',
		publishedAt: new Date('2025-08-20').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: meetingRoom,
		mediaAlt: 'Modern office space',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-10',
		title: 'Work-Life Balance Matters',
		summary:
			'At our company, we believe in the importance of work-life balance. Happy teams create better products.',
		publishedAt: new Date('2025-08-15').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: workLife,
		mediaAlt: 'Work-life balance',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-11',
		title: 'Innovation Summit 2025',
		summary:
			'Our team attended the Innovation Summit where we showcased our latest projects and networked with industry leaders.',
		publishedAt: new Date('2025-08-10').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: asset,
		mediaAlt: 'Innovation summit',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-12',
		title: 'Community Outreach Initiative',
		summary:
			'Giving back to our community through technology education programs. Teaching coding to the next generation of developers.',
		publishedAt: new Date('2025-08-05').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: meetingRoom,
		mediaAlt: 'Community initiative',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-13',
		title: 'Product Feature Update',
		summary:
			'Launched new AI-powered features that enhance user experience and streamline workflows for our enterprise clients.',
		publishedAt: new Date('2025-07-28').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: ecommerce,
		mediaAlt: 'Product update',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-14',
		title: 'Summer Team Retreat',
		summary:
			'Amazing few days spent with the team at our summer retreat, combining strategic planning with outdoor activities and bonding.',
		publishedAt: new Date('2025-07-20').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: karaoke,
		mediaAlt: 'Team retreat',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-15',
		title: 'Sustainability Commitment',
		summary:
			'Proud to announce our carbon-neutral certification. We are committed to building technology that is good for people and the planet.',
		publishedAt: new Date('2025-07-15').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: workLife,
		mediaAlt: 'Sustainability initiative',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-16',
		title: 'Developer Workshop Series',
		summary:
			'Kicking off our monthly developer workshop series covering modern web technologies, best practices, and emerging trends.',
		publishedAt: new Date('2025-07-10').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: workhard,
		mediaAlt: 'Developer workshop',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-17',
		title: 'Client Partnership Milestone',
		summary:
			'Celebrating 5 years of partnership with one of our longest-standing clients. Together we have built amazing digital experiences.',
		publishedAt: new Date('2025-07-05').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: meetingRoom,
		mediaAlt: 'Partnership celebration',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-18',
		title: 'Design System Launch',
		summary:
			'Introducing our new open-source design system that helps teams build consistent, accessible, and beautiful interfaces faster.',
		publishedAt: new Date('2025-06-28').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: ecommerce,
		mediaAlt: 'Design system',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-19',
		title: 'Hackathon Winners',
		summary:
			'Congratulations to our internal hackathon winners! Incredible innovations emerged from 48 hours of creativity and collaboration.',
		publishedAt: new Date('2025-06-20').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: shuffleboard,
		mediaAlt: 'Hackathon event',
		ctaLabel: 'View post'
	},
	{
		id: 'mock-post-20',
		title: 'Year in Review',
		summary:
			'Looking back at an incredible year of growth, innovation, and success. Thank you to our amazing team and clients.',
		publishedAt: new Date('2025-06-15').toISOString(),
		link: 'https://www.linkedin.com/company/90364210/',
		mediaUrl: asset,
		mediaAlt: 'Year in review',
		ctaLabel: 'View post'
	}
];
