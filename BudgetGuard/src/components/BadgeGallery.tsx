import { BadgeDisplay } from './BadgeDisplay';

import { BADGES } from '../utils/badges';


export interface BadgeGalleryProps {

earnedBadges: string[];

}


export function BadgeGallery({ earnedBadges }: BadgeGalleryProps) {

const earnedCount = BADGES.filter((badge) => earnedBadges.includes(badge.id)).length;


return (

<section className="rounded-xl bg-gray-50 p-6 shadow-sm">

<h2 className="mb-6 text-2xl font-bold text-gray-900">Badge Collection</h2>

<p className="mb-6 text-sm font-medium text-blue-600">

Earned {earnedCount} of {BADGES.length} badges

</p>

<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">

{BADGES.map((badge) => (

<BadgeDisplay

key={badge.id}

icon={badge.icon}

name={badge.name}

description={badge.description}

earned={earnedBadges.includes(badge.id)}

/>

))}

</div>

</section>

);

}