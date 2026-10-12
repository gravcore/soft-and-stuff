import GT from 'territory-gt';

export interface GtCoverageEntry {
    departamento: string;
    municipio: string;
    zone: 'metro' | 'departamental';
}

const METRO_DEPARTAMENTO = 'Guatemala';

const municipiosByDepartamento = GT.municipios();

export const GT_COVERAGE: GtCoverageEntry[] = Object.entries(municipiosByDepartamento)
    .flatMap(([departamento, municipios]) => 
        municipios.map((municipio) => ({
            departamento,
            municipio,
            zone: departamento === METRO_DEPARTAMENTO ? 'metro' : 'departamental',
        }))
    );

export const departamentos = (): string[] => GT.departamentos();
export const municipiosFor = (departamento: string): string[] => GT.municipios(departamento) ?? [];

// Revere lookup 
const zoneByMunicipio = new Map(GT_COVERAGE.map((entry) => [entry.municipio, entry.zone]));
export const zoneFor = (municipio: string): GtCoverageEntry['zone'] | undefined => zoneByMunicipio.get(municipio);