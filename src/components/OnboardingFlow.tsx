import React, { useState } from 'react';
import { Check, ChevronRight, ChevronLeft, DollarSign, TrendingUp } from 'lucide-react';
import { industriesData, subsectorsData } from '../data/industriesList';

export interface UserPreferences {
  investmentTypes: string[];
  checkSize: string[];
  sectors: string[];
  subsectors: string[];
  segments: string[];
}

interface OnboardingFlowProps {
  onComplete: (preferences: UserPreferences) => void;
  onSkip?: () => void;
}

const INVESTMENT_TYPES = [
  { id: 'angel', label: 'Angel', description: 'Individual angel investors' },
  { id: 'pre-seed', label: 'Pre-Seed', description: 'Very early stage funding' },
  { id: 'seed', label: 'Seed', description: 'Initial funding round' },
  { id: 'early-stage', label: 'Early-Stage VC', description: 'Series A & B' },
  { id: 'late-stage', label: 'Late-Stage VC', description: 'Series C, D+' },
  { id: 'corporate-vc', label: 'Corporate VC', description: 'Corporate investors' },
  { id: 'pe-growth', label: 'PE Growth', description: 'Private equity growth' },
  { id: 'ma', label: 'M&A', description: 'Mergers & acquisitions' },
  { id: 'ipo', label: 'IPO', description: 'Initial public offering' },
];

const CHECK_SIZES = [
  { id: 'micro', label: 'Micro', range: '< $5M' },
  { id: 'small', label: 'Small', range: '$5M - $25M' },
  { id: 'medium', label: 'Medium', range: '$25M - $100M' },
  { id: 'large', label: 'Large', range: '$100M - $500M' },
  { id: 'mega', label: 'Mega', range: '$500M - $1B' },
  { id: 'giant', label: 'Giant', range: '> $1B' },
];





const SEGMENTS = [
  { id: 'payments', name: 'Payments', parent: 'fintech' },
  { id: 'insurtech-segment', name: 'Insurtech', parent: 'fintech' },
  { id: 'cybersecurity', name: 'Cybersecurity', parent: 'fintech' },
  { id: 'digital-assets', name: 'Digital assets', parent: 'fintech' },
  { id: 'regtech', name: 'Regtech', parent: 'fintech' },
  { id: 'wealthtech', name: 'Wealthtech', parent: 'fintech' },
];


export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    investmentTypes: [],
    checkSize: [],
    sectors: [],
    subsectors: [],
    segments: [],
  });

  // Only show Segments step if Fintech is selected as a subsector
  const hasFintech = preferences.subsectors.includes('fintech');
  const showSegmentsStep = hasFintech;
  const totalSteps = showSegmentsStep ? 5 : 4;

  const toggleSelection = (category: keyof UserPreferences, value: string) => {
    setPreferences(prev => {
      const current = prev[category];
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: newValue };
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return preferences.investmentTypes.length > 0;
      case 2: return preferences.checkSize.length > 0;
      case 3: return preferences.sectors.length > 0;
      case 4: return preferences.subsectors.length > 0;
      case 5: return showSegmentsStep ? preferences.segments.length > 0 : true;
      default: return false;
    }
  };

  const handleNext = () => {
    // If on step 4 and Segments step is not needed, finish onboarding
    if (step === 4 && !showSegmentsStep) {
      onComplete(preferences);
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(preferences);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const getFilteredSubsectors = () => {
    if (preferences.sectors.length === 0) return subsectorsData;
    return subsectorsData.filter(subsector => 
      preferences.sectors.includes(subsector.parent)
    );
  };

  const getFilteredSegments = () => {
    if (preferences.subsectors.length === 0) return SEGMENTS;
    return SEGMENTS.filter(segment => 
      preferences.subsectors.includes(segment.parent)
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Investment Types</h2>
            <p className="text-gray-600 mb-8">Select the investment stages you're interested in</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INVESTMENT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => toggleSelection('investmentTypes', type.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                    preferences.investmentTypes.includes(type.id)
                      ? 'border-[#183661] bg-[#183661]/5 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-gray-900">{type.label}</span>
                    {preferences.investmentTypes.includes(type.id) && (
                      <Check className="w-5 h-5 text-[#183661]" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Check Size</h2>
            <p className="text-gray-600 mb-8">What deal sizes are you tracking?</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CHECK_SIZES.map(size => (
                <button
                  key={size.id}
                  onClick={() => toggleSelection('checkSize', size.id)}
                  className={`p-6 rounded-xl border-2 text-center transition-all hover:shadow-md ${
                    preferences.checkSize.includes(size.id)
                      ? 'border-[#C7B299] bg-[#C7B299]/5 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <span className="font-bold text-xl text-gray-900">{size.label}</span>
                    {preferences.checkSize.includes(size.id) && (
                      <Check className="w-5 h-5 text-[#C7B299] ml-2" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{size.range}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Sectors</h2>
            <p className="text-gray-600 mb-8">Which sectors interest you?</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {industriesData.map(sector => {
                const Icon = sector.icon;
                const isSelected = preferences.sectors.includes(sector.id);
                return (
                  <button
                    key={sector.id}
                    onClick={() => toggleSelection('sectors', sector.id)}
                    className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-[#183661] bg-[#183661]/5 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <Icon size={24} className={isSelected ? 'text-[#183661]' : 'text-gray-400'} />
                      <span className="font-semibold text-gray-900 flex-1 text-left">{sector.title}</span>
                      {isSelected && <Check className="w-5 h-5 text-[#183661]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 4:
        const filteredSubsectors = getFilteredSubsectors();
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Subsectors</h2>
            <p className="text-gray-600 mb-8">Select specific subsectors within Financial Services</p>
            {filteredSubsectors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Please select Financial Services in the previous step
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubsectors.map(subsector => {
                  const isSelected = preferences.subsectors.includes(subsector.id);
                  return (
                    <button
                      key={subsector.id}
                      onClick={() => toggleSelection('subsectors', subsector.id)}
                      className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${
                        isSelected
                          ? 'border-[#C7B299] bg-[#C7B299]/5 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{subsector.name}</span>
                        {isSelected && <Check className="w-5 h-5 text-[#C7B299]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 5:
        // Only show Segments step if Fintech is selected
        if (!showSegmentsStep) return null;
        const filteredSegments = getFilteredSegments();
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Segments</h2>
            <p className="text-gray-600 mb-8">Choose specific segments within Fintech</p>
            {filteredSegments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Please select Fintech in the subsectors step
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSegments.map(segment => {
                  const isSelected = preferences.segments.includes(segment.id);
                  return (
                    <button
                      key={segment.id}
                      onClick={() => toggleSelection('segments', segment.id)}
                      className={`p-6 rounded-xl border-2 text-center transition-all hover:shadow-md ${
                        isSelected
                          ? 'border-[#183661] bg-[#183661]/5 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-bold text-xl text-gray-900">{segment.name}</span>
                        {isSelected && <Check className="w-5 h-5 text-[#183661]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round((step / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#183661] to-[#C7B299] transition-all duration-500 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              step === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-center gap-2">
            {onSkip && (
              <button
                onClick={onSkip}
                className="px-6 py-3 rounded-full font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${
                canProceed()
                  ? 'bg-gradient-to-r from-[#183661] to-[#C7B299] text-white hover:shadow-lg transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {step === totalSteps ? 'Complete' : 'Next'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
