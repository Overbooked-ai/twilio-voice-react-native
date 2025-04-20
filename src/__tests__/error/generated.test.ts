/**
 * =============================================================================
 * NOTE(mhuynh): if tests fail in this file, ensure that errors have been
 * generated. Try `yarn run build:errors`.
 * =============================================================================
 */

import { errorsByCode } from '../../error/generated';
import * as AllErrors from '../../error/generated';
import { TwilioError } from '../../error/TwilioError';

jest.mock('../../common');

/**
 * NOTE(mhuynh): We can import the USED_ERRORS array from the generation script
 * to check that the generated errors actually contain all the expected/desired
 * errors.
 *
 * We need to ts-ignore the import since the file is plain JS.
 */
// @ts-ignore
import { ERRORS } from '../../../scripts/errors.js';
const TYPED_ERRORS = ERRORS as string[];

const getNamesFromExport = () => {
  return Object.entries(AllErrors).reduce<{
    namespaced: string[];
    nonNamespaced: string[];
  }>(
    (reduction, [key, errorOrNamespace]) => {
      // Skip errorsByCode entry
      if (key === 'errorsByCode') {
        return reduction;
      }
      
      if (typeof errorOrNamespace === 'function') {
        // Ensure errorOrNamespace has a name property
        const name = errorOrNamespace.name || '';
        return {
          ...reduction,
          nonNamespaced: [...reduction.nonNamespaced, name],
        };
      } else if (typeof errorOrNamespace === 'object' && errorOrNamespace !== null) {
        const errorNames = Object.values(errorOrNamespace)
          .filter(value => typeof value === 'function')
          .map(errorConstructor => (errorConstructor as Function).name || '');
        
        return {
          ...reduction,
          namespaced: [...reduction.namespaced, ...errorNames],
        };
      }
      
      return reduction;
    },
    {
      nonNamespaced: [],
      namespaced: [],
    }
  );
};

describe('generated errors', () => {
  it('contains all the expected error classes', () => {
    const ErrorNamespaces = Object.entries(AllErrors).filter(([k]) => {
      return k !== 'errorsByCode';
    });

    const generatedErrorNames = ErrorNamespaces.flatMap(
      ([namespace, namespaceErrors]) => {
        if (typeof namespaceErrors === 'object' && namespaceErrors !== null) {
          return Object.keys(namespaceErrors).flatMap((errorName) => {
            return `${namespace}.${errorName}`;
          });
        }
        return [];
      }
    );

    expect(generatedErrorNames.sort()).toStrictEqual(TYPED_ERRORS.sort());
  });

  for (const [code, ErrorClass] of errorsByCode.entries()) {
    describe(`${ErrorClass.name} - ${code}`, () => {
      it('constructs', () => {
        expect(() => new ErrorClass('foobar')).not.toThrow();
      });

      it('defaults the message to the explanation', () => {
        let error: TwilioError | null = null;
        expect(
          () => (error = new ErrorClass(undefined))
        ).not.toThrow();
        expect(error).not.toBeNull();
        if (error) {
          const msg = `${error.name} (${error.code}): ${error.explanation}`;
          expect(error.message).toBe(msg);
        }
      });
    });
  }
});

describe('errorsByCode', () => {
  it('is a Map', () => {
    expect(errorsByCode).toBeInstanceOf(Map);
  });

  it('contains "undefined" for an error code that does not exist', () => {
    expect(errorsByCode.get(999999)).toBeUndefined();
  });

  it('contains an entry for every exported error', () => {
    const namesFromMap = Array.from(errorsByCode.values()).map(
      (errorConstructor) => errorConstructor.name
    );
    
    const exportedNames = getNamesFromExport();
    expect(namesFromMap.sort()).toStrictEqual(
      exportedNames.namespaced.sort()
    );
  });
});
