import pick from 'lodash/pick';
import { IPaginationBaseState } from 'react-jhipster';

/**
 * Removes fields with an 'id' field that equals ''.
 * This function was created to prevent entities to be sent to
 * the server with an empty id and thus resulting in a 500.
 *
 * @param entity Object to clean.
 */
export const cleanEntity = entity => {
  const keysToKeep = Object.keys(entity).filter(k => !(entity[k] instanceof Object) || (entity[k]['id'] !== '' && entity[k]['id'] !== -1));

  return pick(entity, keysToKeep);
};

/**
 * Simply map a list of element to a list a object with the element as id.
 *
 * @param idList Elements to map.
 * @returns The list of objects with mapped ids.
 */
export const mapIdList = (idList: ReadonlyArray<any>) => idList.filter((id: any) => id !== '').map((id: any) => ({ id }));

export const overridePaginationStateWithQueryParams = (paginationBaseState: IPaginationBaseState, locationSearch: string) => {
  // MANAGEMENT 11. url의 쿼리문자열로 파라미터 값을 가져와 params에 할당
  // 쿼리 문자열의 파라미터 값에서 page와 sort를 각각 읽어와서 변수에 할당
  const params = new URLSearchParams(locationSearch);
  const page = params.get('page');
  const sort = params.get('sort');
  // MANAGEMENT 12. 페이지와 정렬방식 값이 있으면 실행
  if (page && sort) {
    // MANAGEMENT 13. 정렬방식을 콤마 기준으로 나누어 배열에 저장(ex. sort=id,asc)
    const sortSplit = sort.split(',');
    // MANAGEMENT 14. IPaginationBaseState의 페이지에 파라미터의 page를 더한 값을 할당
    // 정렬 기준은 0번 배열인 id
    // 정렬 순서는 1번 배열인 asc
    paginationBaseState.activePage = +page;
    paginationBaseState.sort = sortSplit[0];
    paginationBaseState.order = sortSplit[1];
  }
  // MANAGEMENT 15. 설정한 IPaginationBaseState를 리턴
  return paginationBaseState;
};
