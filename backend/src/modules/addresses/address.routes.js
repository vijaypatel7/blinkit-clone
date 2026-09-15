import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { addressController } from './address.controller.js';
import { createAddressSchema, updateAddressSchema } from './address.validation.js';
import { idParamSchema } from '../../common/validators/querySchemas.js';

/**
 * Address routes (authenticated).
 */
export const addressRoutes = Router();

addressRoutes.get('/', addressController.list);
addressRoutes.post('/', validateRequest({ body: createAddressSchema }), addressController.create);
addressRoutes.patch(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateAddressSchema }),
  addressController.update
);
addressRoutes.put('/:id/default', validateRequest({ params: idParamSchema }), addressController.setDefault);
addressRoutes.delete('/:id', validateRequest({ params: idParamSchema }), addressController.remove);
