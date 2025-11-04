import { Router } from 'express';
import { searchFlights } from '../controllers/searchController';

export const searchRouter = Router();

searchRouter.post('/', searchFlights);
