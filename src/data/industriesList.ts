import { Shield, Activity, Landmark, Car, Store, Zap, Building, Factory, Dna, Cloud } from 'lucide-react';
// Centralized subsectors for Financial Services
export const subsectorsData = [
  {
    id: 'fintech',
    name: 'Fintech',
    description: 'Pulse of Fintech H2 2025',
    icon: Activity,
    parent: 'financial-services',
  },
  {
    id: 'insurtech',
    name: 'Insurtech',
    description: 'State of Insurtech 2025',
    icon: Shield,
    parent: 'financial-services',
  },
  {
    id: 'banking',
    name: 'Banking',
    description: 'Feed Report - Banks - Aug 2025',
    icon: Landmark,
    parent: 'financial-services',
  },
];
// Centralized industries/sectors list for use across the app
// Move this file to src/data/industriesList.ts if you want to change the location

export const industriesData = [
  {
    id: 'automotive',
    title: 'Automotive',
    description: 'Discover our expertise in the automotive sector and how we assist clients in confidently navigating the future of this industry.',
    icon: Car,
    linkText: 'Read more',
  },
  {
    id: 'consumer-retail',
    title: 'Consumer, Retail & Leisure',
    description: 'Gain insights into our in-depth understanding of agriculture, grocery, luxury goods, food and beverage, and leisure industries.',
    icon: Store,
    linkText: 'Read more',
  },
  {
    id: 'energy-resources',
    title: 'Energy, Natural Resources and Chemicals',
    description: 'Find out how our experts collaborate with top companies in the energy, utility, renewable, mining, and chemicals industries to uncover new and sustainable opportunities.',
    icon: Zap,
    linkText: 'Read more',
  },
  {
    id: 'financial-services',
    title: 'Financial Services',
    description: 'Uncover how our expertise in asset management, banking and capital markets, insurance, private equity, and real estate can help build a more robust financial services system.',
    icon: Landmark,
    linkText: 'Read more',
  },
  {
    id: 'government-public',
    title: 'Government & public sector',
    description: 'See how our global experience in cities, defense and national security, education, human and social services, international development, and public transport can enhance organizations\' digital footprint and promote sustainable practices.',
    icon: Building,
    linkText: 'Read more',
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    description: 'Learn how we are advancing the healthcare industry by offering advice and innovative strategies to meet the challenges of today\'s healthcare environment.',
    icon: Activity,
    linkText: 'Read more',
  },
  {
    id: 'industrial-manufacturing',
    title: 'Industrial Manufacturing',
    description: 'Explore how we support the industrial manufacturing industry, including aerospace and defense, metals, and materials, by combining traditional methods with cutting-edge technology to enhance productivity.',
    icon: Factory,
    linkText: 'Read more',
  },
  {
    id: 'life-sciences',
    title: 'Life Sciences',
    description: 'See how we guide life sciences organizations, including medical device and biotechnology fields, to navigate complex business challenges.',
    icon: Dna,
    linkText: 'Read more',
  },
  {
    id: 'technology-media',
    title: 'Technology, Media & Telecommunications',
    description: 'Disruptive technologies and new business models are continuously re-defining companies within the technology sector. KPMG’s Technology professionals combine industry knowledge with technical experience to help leaders turn opportunities into insights.',
    icon: Cloud,
    linkText: 'Read more',
  },
];
