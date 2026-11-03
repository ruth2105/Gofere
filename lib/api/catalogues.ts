import { api, DestinationApiRecord, PaginatedResponse, UniversityApiRecord } from './client';

async function getAllPages<T>(
  fetchPage: (page: number) => Promise<PaginatedResponse<T>>
): Promise<T[]> {
  const records: T[] = [];
  let page = 1;
  let response: PaginatedResponse<T>;

  do {
    response = await fetchPage(page);
    records.push(...response.results);
    page += 1;
  } while (response.next);

  return records;
}

export function getDestinations(): Promise<DestinationApiRecord[]> {
  return getAllPages((page) => api.destinations.list({ page }));
}

export function getDestination(slug: string): Promise<DestinationApiRecord> {
  return api.destinations.get(slug);
}

export function getUniversities(country?: string): Promise<UniversityApiRecord[]> {
  return getAllPages((page) => api.universities.list({ page, country }));
}

export function getUniversity(slug: string): Promise<UniversityApiRecord> {
  return api.universities.get(slug);
}
