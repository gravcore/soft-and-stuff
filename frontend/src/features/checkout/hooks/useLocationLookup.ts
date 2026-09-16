import { useQuery } from '@tanstack/react-query';
import { getCitiesOfState, getStatesOfCountry } from '@countryStatecity/countries-browser';

// enabled: false until countryCode exists
export const useStatesForCountry = (countryCode: string | undefined) =>
    useQuery({
        queryKey: ['locations', 'states', countryCode],
        queryFn: () => getStatesOfCountry(countryCode!),
        enabled: !!countryCode,
        staleTime: Infinity,
    });

export const useCitiesForState = (countryCode: string | undefined, stateCode: string | undefined) =>
    useQuery({
        queryKey: ['locations', 'cities', countryCode, stateCode],
        queryFn: () => getCitiesOfState(countryCode!, stateCode!),
        enabled: !!countryCode && !!stateCode,
        staleTime: Infinity,
    })