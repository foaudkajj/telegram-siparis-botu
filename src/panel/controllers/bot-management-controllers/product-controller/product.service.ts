import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Product} from 'src/db/models/product';
import {DataSourceLoadOptionsBase} from 'src/panel/dtos/devextreme-query';
import {UIResponseBase} from 'src/panel/dtos/ui-response-base';
import {QueryFailedError, Repository} from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async Get(query: DataSourceLoadOptionsBase) {
    let entities: Product[];
    if (query.take && query.skip) {
      entities = await this.productRepository.find({
        take: query.take,
        skip: query.skip,
      });
    } else {
      entities = await this.productRepository.find();
    }
    const response: UIResponseBase<Product> = {
      IsError: false,
      data: entities,
      totalCount: entities.length,
      MessageKey: 'SUCCESS',
      StatusCode: 200,
    };
    return response;
  }

  async Insert(product: Product) {
    try {
      const response: UIResponseBase<Product> = {
        IsError: false,
        Result: product,
        MessageKey: 'SUCCESS',
        StatusCode: 200,
      };
      await this.productRepository.insert(product);
      return response;
    } catch (error) {
      console.log((error as QueryFailedError).message);
      throw <UIResponseBase<Product>>{
        IsError: true,
        MessageKey: 'ERROR',
        StatusCode: 500,
      };
    }
  }

  async Update(updateDetails: Product) {
    try {
      const product = await this.productRepository.findOne({
        where: {Id: updateDetails.Id},
      });
      const {Id, ...updatedEntity} = {...product, ...updateDetails};
      await this.productRepository.update({Id: product.Id}, updatedEntity);
      return <UIResponseBase<Product>>{
        IsError: false,
        Result: updatedEntity,
        MessageKey: 'SUCCESS',
        StatusCode: 200,
      };
    } catch (error) {
      console.log(error);
      throw <UIResponseBase<Product>>{
        IsError: true,
        MessageKey: 'ERROR',
        StatusCode: 500,
      };
    }
  }

  async Delete(Id: number) {
    try {
      await this.productRepository.delete({Id: Id});
      return <UIResponseBase<Product>>{
        IsError: false,
        MessageKey: 'SUCCESS',
        StatusCode: 200,
      };
    } catch (error) {
      console.log(error);
      throw <UIResponseBase<Product>>{
        IsError: true,
        MessageKey: 'ERROR',
        StatusCode: 500,
      };
    }
  }
}
